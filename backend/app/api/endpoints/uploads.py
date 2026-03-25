from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from sqlalchemy.orm import Session
import os
import shutil
import uuid
from app.api.deps import get_db
from app.api.models.orm.candidate import Candidate
from app.api.models.orm.job import Job
from app.services.cv_parser import extract_text
from app.services.ai_service import extract_candidate_data
from app.services.embedding_service import generate_embedding
from app.schemas.candidate import CandidateResponse
from pydantic import UUID4

router = APIRouter()

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/cv", response_model=CandidateResponse)
def upload_cv(
    job_id: UUID4 = Form(...),
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    # Verify job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    file_ext = file.filename.split(".")[-1].lower()
    ALLOWED_TYPES = ["pdf", "docx"]

    if file_ext not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload PDF or DOCX."
        )

    try:
        unique_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = extract_text(file_path)

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Failed to extract text from CV")

        # Extract structured data using OpenAI
        candidate_data = extract_candidate_data(extracted_text)
        
        # Generate embedding for the raw text using OpenAI
        embedding = generate_embedding(extracted_text)

        candidate = Candidate(
            job_id=job_id,
            full_name=candidate_data.get("full_name", "Unknown"),
            email=candidate_data.get("email", "unknown@example.com"),
            phone=candidate_data.get("phone"),
            skills=candidate_data.get("skills", []),
            experience_years=candidate_data.get("experience_years", 0),
            education=candidate_data.get("education"),
            cv_url=file_path,
            raw_text=extracted_text,
            embedding=embedding
        )

        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        return candidate

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")
