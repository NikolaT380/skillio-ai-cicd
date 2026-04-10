from fastapi import APIRouter
from app.api.endpoints import jobs, uploads, auth, candidates

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
router.include_router(candidates.router, prefix="/candidates", tags=["Candidates"])
router.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])