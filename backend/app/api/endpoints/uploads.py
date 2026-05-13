from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from sqlalchemy.orm import Session
from typing import Optional
import os
import logging
import shutil
import uuid
from app.api.deps import get_db
from app.api.models.orm.candidate import Candidate
from app.api.models.orm.job import Job
from app.services.cv_parser import extract_text
from app.services.ai_service import extract_candidate_data
from app.services.embedding_service import generate_embedding
from app.schemas.candidate import CandidateResponse, CandidateExtract
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/cv", response_model=CandidateResponse)
def upload_cv(
    job_id: str = Form(..., description="The UUID of the job this CV is for"),
    file: UploadFile = File(...), 
    full_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Process a candidate's CV upload and extract AI-driven insights.
    
    This endpoint takes a PDF or DOCX file and performs the following:
    1. Extracts raw text using PyMuPDF or python-docx.
    2. Sends the text to OpenAI (gpt-4o-mini) to perform Named Entity Recognition (NER),
       extracting the candidate's name, email, skills, and experience.
    3. Generates a 1536-dimensional semantic vector embedding using OpenAI.
    4. Safely moves the processed file to permanent local storage.
    5. Saves the structured candidate profile to the database.
    
    Note: This is a public-facing endpoint so candidates can apply without an account.
    """
    # Convert string back to UUID for database query
    try:
        job_uuid = uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid job_id format. Must be a valid UUID.")

    # Verify job exists
    job = db.query(Job).filter(Job.id == job_uuid).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if not file.filename:
        raise HTTPException(status_code=400, detail="File must have a filename.")

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
        raw_candidate_data = extract_candidate_data(extracted_text)

        # Validate and coerce the AI output using Pydantic
        validated_data = CandidateExtract(**raw_candidate_data)

        # Generate embedding for the raw text using OpenAI
        embedding = generate_embedding(extracted_text)

        # Handle experience conversion (Months -> Years for DB model)
        exp_years = validated_data.experience_total_months // 12

        candidate = Candidate(
            job_id=job_uuid,
            full_name=full_name or validated_data.full_name,
            email=email or validated_data.email,
            phone=phone or validated_data.phone,
            skills=validated_data.skills,
            experience_years=exp_years,
            education=validated_data.education,
            cv_url=unique_name,
            raw_text=extracted_text,
            embedding=embedding
        )

        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        # Move file to permanent storage ONLY AFTER database commit is successful
        shutil.move(temp_path, permanent_path)

        return candidate

    except HTTPException:
        # Re-raise HTTPExceptions so we don't accidentally turn a 400 into a 500
        raise
    except Exception as e:
        db.rollback()
        # If the file was moved but something failed right after, attempt to delete the permanent file
        try:
            if 'permanent_path' in locals() and os.path.exists(permanent_path):
                os.remove(permanent_path)
        except Exception as cleanup_error:
            logger.warning(f"Failed to clean up permanent file after rollback {permanent_path}: {cleanup_error}", exc_info=True)

        logger.error(f"File processing failed: {str(e)}", exc_info=True)
        # Return a generic error message to the client
        raise HTTPException(status_code=500, detail="An internal server error occurred while processing the file.")
    finally:
        # Explicitly close the file handle to prevent file descriptor leaks under load
        try:
            file.file.close()
        except Exception as e:
            logger.warning(f"Failed to close upload file descriptor: {e}")

        # Cleanup: Ensure the temporary file is deleted if it still exists (e.g. if move failed or API crashed)
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as cleanup_error:
                logger.warning(f"Failed to clean up temp file {temp_path}: {cleanup_error}", exc_info=True)