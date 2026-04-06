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

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[CandidateResponse])
def get_candidates(
    job_id: Optional[UUID4] = Query(None, description="Filter candidates by a specific job ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a list of candidates. 
    Can be filtered by job_id. Only returns candidates for jobs created by the current user.
    """
    query = db.query(Candidate).join(Job).filter(Job.creator_id == current_user.id)

    if job_id:
        query = query.filter(Candidate.job_id == job_id)

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
    """
    candidate = db.query(Candidate).join(Job).filter(
        Candidate.id == candidate_id,
        Job.creator_id == current_user.id
    ).first()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found or you don't have permission to view them")
        
    return candidate


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
                resolved_path = os.path.abspath(candidate.cv_url)
                storage_dir = os.path.abspath(settings.LOCAL_STORAGE_DIR)
                if resolved_path.startswith(storage_dir) and os.path.exists(resolved_path):
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