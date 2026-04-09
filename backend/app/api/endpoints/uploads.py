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
from app.core.config import settings

router = APIRouter()

@router.post("/cv", response_model=CandidateResponse)
def upload_cv(
    job_id: str = Form(..., description="The UUID of the job this CV is for"),
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    # Convert string back to UUID for database query
    try:
        job_uuid = uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid job_id format. Must be a valid UUID.")

    # Verify job exists
    job = db.query(Job).filter(Job.id == job_uuid).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    file_ext = file.filename.split(".")[-1].lower()
    ALLOWED_TYPES = ["pdf", "docx"]

    if file_ext not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload PDF or DOCX."
        )

    temp_path = None
    
    try:
        unique_name = f"{uuid.uuid4()}.{file_ext}"

        # Ensure directories exist
        os.makedirs(settings.TEMP_UPLOAD_DIR, exist_ok=True)
        os.makedirs(settings.LOCAL_STORAGE_DIR, exist_ok=True)

        # Temp processing path
        temp_path = os.path.join(settings.TEMP_UPLOAD_DIR, unique_name)

        # Permanent storage path
        permanent_path = os.path.join(settings.LOCAL_STORAGE_DIR, unique_name)

        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = extract_text(temp_path)

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Failed to extract text from CV")

        # Extract structured data using OpenAI
        candidate_data = extract_candidate_data(extracted_text)

        # Generate embedding for the raw text using OpenAI
        embedding = generate_embedding(extracted_text)

        # Move file to permanent storage now that processing is done
        shutil.move(temp_path, permanent_path)

        # Handle experience conversion (Months -> Years for DB model)
        raw_months = candidate_data.get("experience_total_months", 0)
        try:
            total_months = int(raw_months) if raw_months is not None else 0
        except (ValueError, TypeError):
            total_months = 0 # defaulting to 0 if the cast fails or the value is None

        exp_years = total_months // 12

        candidate = Candidate(
            job_id=job_uuid,
            full_name=candidate_data.get("full_name", "Unknown"),
            email=candidate_data.get("email", "unknown@example.com"),
            phone=candidate_data.get("phone"),
            skills=candidate_data.get("skills", []),
            experience_years=exp_years,
            education=candidate_data.get("education"),
            cv_url=unique_name, # relative path - meaning if we migrate to cloud storage (like AWS S3) in the future, our database records will still be valid. It will construct the full URL
            raw_text=extracted_text,
            embedding=embedding
        )

        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        return candidate

    except HTTPException:
        # Re-raise HTTPExceptions so we don't accidentally turn a 400 into a 500
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")
    finally:
        # Cleanup: Ensure the temporary file is deleted if it still exists (e.g. if move failed or API crashed)
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as cleanup_error:
                print(f"Warning: Failed to clean up temp file {temp_path}: {cleanup_error}")
