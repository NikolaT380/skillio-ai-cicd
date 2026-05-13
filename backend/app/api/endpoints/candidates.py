import os
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import UUID4

from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.api.models.orm.candidate import Candidate
from app.api.models.orm.job import Job
from app.api.models.orm.user import User
from app.schemas.candidate import CandidateResponse
from app.services.similarity_service import rank_candidates_for_job

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{job_id}/candidates", response_model=List[CandidateResponse])
def get_candidates_for_job(job_id: UUID4, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return db.query(Candidate).filter(Candidate.job_id == job_id).all()
  

@router.get("/", response_model=List[CandidateResponse])
def get_candidates(
    job_id: Optional[UUID4] = Query(None, description="Filter candidates by a specific job ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a list of candidates. 
    Can be filtered by job_id. Only returns candidates for jobs created by the current user.
    If job_id is provided, candidates are returned with dynamically calculated match scores and statuses.
    """
    query = db.query(Candidate).join(Job).filter(Job.creator_id == current_user.id)

    if job_id:
        query = query.filter(Candidate.job_id == job_id)
        candidates = query.all()

        if not candidates:
            return []

        # If filtered by job_id, dynamically compute similarity scores so the API response isn't misleading
        results = rank_candidates_for_job(db, job_id)
        score_map = {row.id: round(float(row.similarity), 4) for row in results if row.similarity is not None}

        response_list = []
        for c in candidates:
            current_score = score_map.get(c.id, 0.0)
            response_list.append({
                "id": c.id,
                "job_id": c.job_id,
                "full_name": c.full_name,
                "email": c.email,
                "phone": c.phone,
                "skills": c.skills or [],
                "experience_years": c.experience_years,
                "education": c.education,
                "cv_url": c.cv_url,
                "match_score": current_score,
                "status": "recommended" if current_score > 0.40 else "rejected",
                "created_at": c.created_at,
            })

        # Sort the final list by match_score before returning
        response_list.sort(key=lambda x: x["match_score"], reverse=True)
        return response_list

    # If no job_id is provided, just return raw DB objects (match_score=0.0, status=None)
    return query.all()


@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(
    candidate_id: UUID4, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve detailed information for a single candidate. 
    Ensures the user owns the job this candidate is linked to.
    Dynamically computes the match_score and status based on their associated job.
    """
    candidate = db.query(Candidate).join(Job).filter(
        Candidate.id == candidate_id,
        Job.creator_id == current_user.id
    ).first()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found or you don't have permission to view them")
        
    # Dynamically compute similarity score for this single candidate
    results = rank_candidates_for_job(db, candidate.job_id)
    score_map = {row.id: round(float(row.similarity), 4) for row in results if row.similarity is not None}
    
    current_score = score_map.get(candidate.id, 0.0)
    
    return {
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
        "status": "recommended" if current_score > 0.40 else "rejected",
        "created_at": candidate.created_at,
    }


@router.delete("/{candidate_id}", status_code=204)
def delete_candidate(
    candidate_id: UUID4, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a candidate profile from the system.
    This also attempts to delete their associated CV file from storage.
    Ensures the user owns the job this candidate is linked to.
    """
    candidate = db.query(Candidate).join(Job).filter(
        Candidate.id == candidate_id,
        Job.creator_id == current_user.id
    ).first()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found or you don't have permission to delete them")
        
    try:
        # Delete file from local storage if it exists
        if candidate.cv_url and settings.STORAGE_TYPE == "local":
            try:
                file_path = os.path.join(settings.LOCAL_STORAGE_DIR, candidate.cv_url)
                resolved_path = os.path.abspath(file_path)
                storage_dir = os.path.abspath(settings.LOCAL_STORAGE_DIR)
                if os.path.commonpath([resolved_path, storage_dir]) == storage_dir and os.path.exists(resolved_path):
                    os.remove(resolved_path)
            except Exception as fe:
                logger.warning(f"Failed to delete associated CV file {candidate.cv_url}: {fe}")
                # We log it but do not crash the DB deletion

        db.delete(candidate)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database error deleting candidate: {e}")
        raise HTTPException(status_code=500, detail="Database error deleting candidate")
        
    return None
