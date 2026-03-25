from fastapi import APIRouter
from app.api.endpoints import jobs, uploads

router = APIRouter()
router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
router.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])