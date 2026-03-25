from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.job import Job

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_job(title: str, description: str, db: Session = Depends(get_db)):
    job = Job(title=title, description=description)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
