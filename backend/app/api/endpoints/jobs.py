from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.api.models.orm.job import Job
from app.api.models.orm.user import User
from app.services.embedding_service import generate_embedding
from app.services.similarity_service import find_similarity
from app.schemas.job import JobCreate, JobResponse
from typing import List
from pydantic import UUID4

router = APIRouter()

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
            detail=f"Failed to create job or generate embedding: {str(e)}"
        )

@router.get("/", response_model=List[JobResponse])
def get_jobs(db: Session = Depends(get_db)):
    return db.query(Job).all()

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: UUID4, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/{job_id}/match")
def match_candidates(job_id: UUID4, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    results = find_similarity(db, job_id)

    output = []
    for r in results:
        score = float(r.similarity)

        output.append({
            "candidate_id": r.id,
            # "full_name": r.full_name,
            "score": round(score, 3),
            "status": "recommended" if score > 0.75 else "rejected"
        })

    return output

@router.delete("/{job_id}", status_code=204)
def delete_job(
    job_id: UUID4, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
        db.delete(job)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to delete job: {str(e)}"
        )
    
    return None
