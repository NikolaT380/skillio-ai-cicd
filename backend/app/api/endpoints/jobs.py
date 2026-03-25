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
    try:
        embedding = generate_embedding(job_in.description)

        job = Job(
            title=job_in.title,
            description=job_in.description,
            requirements=job_in.requirements,
            mandatory_criteria=job_in.mandatory_criteria,
            company_name=job_in.company_name,
            location=job_in.location,
            embedding=embedding
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
