import os
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, get_current_user_optional
from app.api.models.orm.job import Job
from app.api.models.orm.user import User
from app.services.embedding_service import generate_embedding
from app.services.similarity_service import rank_candidates_for_job
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.schemas.candidate import CandidateResponse
from typing import List
from pydantic import UUID4
from app.core.config import settings
from app.api.models.orm.candidate import Candidate

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=JobResponse)
def create_job(job_in: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Create a new job posting and generate its AI embedding for semantic matching.
    """
    try:
        # Create a rich text context for the embedding: title + description + requirements
        # This provides a better semantic representation than just the description alone.
        embedding_content = f"{job_in.title}\n\n{job_in.description}\n\nRequirements: {', '.join(job_in.requirements)}"
        
        embedding = generate_embedding(embedding_content)

        job = Job(
            title=job_in.title,
            description=job_in.description,
            requirements=job_in.requirements,
            mandatory_criteria=job_in.mandatory_criteria,
            company_name=job_in.company_name,
            location=job_in.location,
            embedding=embedding,
            creator_id=current_user.id
        )

        db.add(job)
        db.commit()
        db.refresh(job)

        return job

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail="Failed to create job or generate embedding"
        )

@router.get("/", response_model=List[JobResponse])
def get_jobs(
    db: Session = Depends(get_db), 
    current_user: User | None = Depends(get_current_user_optional)
):
    """
    Get all jobs. If an HR Admin is logged in, this still returns all jobs, 
    but we could easily filter by creator_id if a 'mine' query param was added.
    """
    return db.query(Job).all()

@router.patch("/{job_id}", response_model=JobResponse)
def update_job(job_id: UUID4, job_in: JobUpdate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    update_data = job_in.model_dump(exclude_unset=True)

    if "description" in update_data:
        update_data["embedding"] = generate_embedding(update_data["description"])

    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return job

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: UUID4, db: Session = Depends(get_db)):
    """
    Get details of a specific job. Publicly accessible.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=404, 
            detail="Job not found"
        )
    return job

@router.get("/{job_id}/candidates", response_model=List[CandidateResponse])
def get_ranked_candidates(
    job_id: UUID4,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve and rank all candidates who applied for a specific job.

    This endpoint uses the `pgvector` Cosine Similarity operator to compare
    the AI-generated embedding of the job description against the embeddings
    of all candidates' CVs.
    
    The results are sorted dynamically by `match_score` (highest first).
    Candidates scoring above 0.40 are flagged as 'recommended'.
    Only the HR Admin who created the job can access this data.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Ownership Check: Only the user who created the job can view its candidates.
    if job.creator_id != current_user.id:
        raise HTTPException(
            status_code=403, 
            detail="You do not have permission to view candidates for this job"
        )

    if job.embedding is None:
        raise HTTPException(
            status_code=409,
            detail="Job has no embedding. Cannot compute similarity."
        )

    results = rank_candidates_for_job(db, job_id)

    # Create a dictionary mapping candidate IDs to their similarity scores
    score_map = {row.id: round(float(row.similarity), 4) for row in results if row.similarity is not None}

    # Fetch the actual candidate objects from the DB (All candidates for this job)
    candidates = db.query(Candidate).filter(Candidate.job_id == job_id).all()

    if not candidates:
        return []

    response_list = []
    
    for candidate in candidates:
        current_score = score_map.get(candidate.id, 0.0)
        
        response_list.append({
            "id": candidate.id,
            "job_id": candidate.job_id,
            "full_name": candidate.full_name,
            "email": candidate.email,
            "phone": candidate.phone,
            "skills": candidate.skills or [],
            "experience_years": candidate.experience_years,
            "education": candidate.education,
            "cv_url": candidate.cv_url,
            "match_score": current_score,
            "status": candidate.status or ("recommended" if current_score > 0.40 else "rejected"),
            "created_at": candidate.created_at,
        })

    # Sort the final list by match_score before returning
    response_list.sort(key=lambda x: x["match_score"], reverse=True)

    return response_list

@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: UUID4, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
        Delete a job posting. Only the creator of the job can delete it.
        All associated candidates will be deleted automatically due to
        the cascading foreign key constraint in the database.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Ownership Check: Only the user who created the job can delete it.
    if job.creator_id != current_user.id:
        raise HTTPException(
            status_code=403, 
            detail="You do not have permission to delete this job"
        )
    
    try:
        candidates = db.query(Candidate).filter(Candidate.job_id == job_id).all()
        for candidate in candidates:
            if candidate.cv_url and settings.STORAGE_TYPE == "local":
                try:
                    file_path = os.path.join(settings.LOCAL_STORAGE_DIR, candidate.cv_url)
                    resolved_path = os.path.abspath(file_path)
                    storage_dir = os.path.abspath(settings.LOCAL_STORAGE_DIR)

                    if os.path.commonpath([resolved_path, storage_dir]) == storage_dir and os.path.exists(
                            resolved_path):
                        os.remove(resolved_path)
                except Exception as fe:
                    logger.warning(f"Failed to delete associated CV file {candidate.cv_url}: {fe}")

        db.delete(job)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database error deleting job: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to delete job"
        )