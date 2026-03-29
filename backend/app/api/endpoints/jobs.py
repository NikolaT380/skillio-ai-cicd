from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.api.models.orm.job import Job
from app.api.models.orm.user import User
from app.api.models.orm.candidate import Candidate
from app.services.embedding_service import generate_embedding
from app.services.similarity_service import find_similarity, rank_candidates_for_job
from app.schemas.job import JobCreate, JobResponse
from app.schemas.candidate import CandidateResponse
from typing import List
from pydantic import UUID4

router = APIRouter()

@router.post("/", response_model=JobResponse)
def create_job(job_in: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        embedding = generate_embedding(job_in.description)

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
        raise HTTPException(status_code=500, detail="Internal Server Error")

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

@router.get("/{job_id}/candidates", response_model=List[CandidateResponse])
def get_ranked_candidates(
    job_id: UUID4,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.embedding is None:
        raise HTTPException(
            status_code=409,
            detail="Job has no embedding. Cannot compute similarity."
        )

    results = rank_candidates_for_job(db, job_id)

    if not results:
        return []

    score_map = {row.id: round(float(row.similarity), 4) for row in results if row.similarity is not None}

    ranked_candidates = (
        db.query(Candidate)
        .filter(Candidate.job_id == job_id)
        .all()
    )

    if score_map:
        for candidate in ranked_candidates:
            if candidate.id in score_map:
                candidate.match_score = score_map[candidate.id]

    ranked = sorted(
        ranked_candidates,
        key=lambda c: c.match_score if c.match_score is not None else 0.0,
        reverse=True
    )

    def build_response(c):
        return {
            "id": c.id,
            "job_id": c.job_id,
            "full_name": c.full_name,
            "email": c.email,
            "phone": c.phone,
            "skills": c.skills or [],
            "experience_years": c.experience_years,
            "education": c.education,
            "cv_url": c.cv_url,
            "match_score": c.match_score,
            "status": "recommended" if c.match_score > 0.75 else "rejected",
            "created_at": c.created_at,
        }

    return [build_response(c) for c in ranked]
