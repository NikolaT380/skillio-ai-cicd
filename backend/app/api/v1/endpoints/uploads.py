from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import os
import shutil
import uuid
from app.core.database import SessionLocal
from app.models.cv import CV
from app.services.cv_parser import extract_text
from app.services.embedding_service import generate_embedding
from app.schemas.cv import CVResponse
from typing import List

router = APIRouter()

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/cv", response_model=CVResponse)
def upload_cv(file: UploadFile = File(...), db: Session = Depends(get_db)):
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

        embedding = generate_embedding(extracted_text)

        cv = CV(
            file_path=file_path,
            extracted_text=extracted_text,
            embedding=embedding
        )

        db.add(cv)
        db.commit()
        db.refresh(cv)

        return cv

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")
