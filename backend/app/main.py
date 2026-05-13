from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.router import router
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for AI Recruitment System",
)

# Ensure storage directory exists
os.makedirs(settings.LOCAL_STORAGE_DIR, exist_ok=True)

# Mount static files for CV downloads
app.mount("/uploads", StaticFiles(directory=settings.LOCAL_STORAGE_DIR), name="uploads")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Extract only safe fields to prevent logging raw sensitive inputs
    sanitized_errors = [
        {"loc": err.get("loc"), "msg": err.get("msg"), "type": err.get("type")}
        for err in exc.errors()
    ]

    logger.error(f"Validation error on {request.url.path}: {sanitized_errors}")

    return JSONResponse(
        status_code=422,
        content={"detail": sanitized_errors}
    )

app.include_router(router)

# Set up CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173", # Vite default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to the AI Recruitment System API", "docs": "/docs"}
