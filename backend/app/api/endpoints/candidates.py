import os
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
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



@router.get("/", response_model=List[CandidateResponse])
def get_candidates(
    job_id: Optional[UUID4] = Query(None, description="Filter candidates by a specific job ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a list of candidates. 
    Can be filtered by job_id. Only returns candidates for jobs created by the current user.
    Always returns candidates with dynamically calculated match scores relative to their job.
    """
    if job_id:
        query = db.query(Candidate).join(Job).filter(
            Job.creator_id == current_user.id,
            Candidate.job_id == job_id
        )
        candidates = query.all()
        if not candidates:
            return []
            
        results = rank_candidates_for_job(db, job_id)
        score_map = {row.id: round(float(row.similarity), 4) for row in results if row.similarity is not None}
    else:
        # Calculate scores for all candidates relative to their respective jobs
        # using a raw SQL join for efficiency with pgvector
        query_sql = text("""
            SELECT c.id, 
                   1 - (c.embedding <=> j.embedding) AS similarity
            FROM candidates c
            JOIN jobs j ON c.job_id = j.id
            WHERE j.creator_id = :user_id
              AND c.embedding IS NOT NULL
              AND j.embedding IS NOT NULL
        """)
        results = db.execute(query_sql, {"user_id": current_user.id}).fetchall()
        score_map = {row.id: round(float(row.similarity), 4) for row in results if row.similarity is not None}
        
        candidates = db.query(Candidate).join(Job).filter(Job.creator_id == current_user.id).all()

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
            "status": c.status or ("recommended" if current_score > 0.40 else "rejected"),
            "created_at": c.created_at,
        })
    # Sort the final list by match_score before returning
    response_list.sort(key=lambda x: x["match_score"], reverse=True)
    return response_list


@router.get("/status/")
def get_candidate_status_by_email(
    email: str = Query(..., description="Email address used when applying"),
    db: Session = Depends(get_db)
):
    """
    Public endpoint — no auth required.
    Returns the most recent application status for the given email.
    """
    candidate = (
        db.query(Candidate)
        .filter(Candidate.email == email)
        .order_by(Candidate.created_at.desc())
        .first()
    )
    if not candidate:
        raise HTTPException(status_code=404, detail="No application found for this email")

    job = db.query(Job).filter(Job.id == candidate.job_id).first()
    
    return {
        "id": str(candidate.id),
        "full_name": candidate.full_name,
        "email": candidate.email,
        "job_title": job.title if job else "Unknown Position",
        "status": candidate.status or "submitted",
        "created_at": candidate.created_at,
    }


@router.patch("/{candidate_id}/status/")
def update_candidate_status(
    candidate_id: UUID4,
    status_update: dict, # simple dict for now: {"status": "recommended"}
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update the status of a candidate. 
    Only the owner of the job can update the candidate's status.
    """
    candidate = db.query(Candidate).join(Job).filter(
        Candidate.id == candidate_id,
        Job.creator_id == current_user.id
    ).first()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found or you don't have permission")

    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Missing 'status' in request body")

    candidate.status = new_status
    db.commit()
    return {"message": "Status updated successfully", "status": new_status}


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
