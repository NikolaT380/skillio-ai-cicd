from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import shutil
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads/"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/cv")
def upload_cv(file: UploadFile = File(...)):
    file_ext = file.filename.split(".")[-1].lower()  # .lower() helps with .PDF vs .pdf
    ALLOWED_TYPES = ["pdf", "docx"]

    if file_ext not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF or DOCX.")

    try:
        unique_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "original_filename": file.filename,
            "stored_filename": unique_name,
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
