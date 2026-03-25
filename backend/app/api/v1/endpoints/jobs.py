from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.job import Job
from app.services.embedding_service import generate_embedding
from app.services.similarity_service import find_similarity
from app.schemas.job import JobResponse
from typing import List

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=JobResponse)
def create_job(title: str, description: str, db: Session = Depends(get_db)):
    try:
        embedding = generate_embedding(description)

        job = Job(
            title=title,
            description=description,
            embedding=embedding
        )

        db.add(job)
        db.commit()
        db.refresh(job)

        return job

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[JobResponse])
def get_jobs(db: Session = Depends(get_db)):
    return db.query(Job).all()


@router.get("/{job_id}/match")
def match_candidates(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    results = find_similarity(db, job_id)

    output = []
    for r in results:
        score = float(r.similarity)

        output.append({
            "cv_id": r.id,
            "score": round(score, 3),
            "status": "recommended" if score > 0.75 else "rejected"
        })

    return output
