from fastapi import FastAPI
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

app.include_router(router)

# Ensure storage directory exists
os.makedirs(settings.LOCAL_STORAGE_DIR, exist_ok=True)

# Mount static files for CV downloads
app.mount("/uploads", StaticFiles(directory=settings.LOCAL_STORAGE_DIR), name="uploads")

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
