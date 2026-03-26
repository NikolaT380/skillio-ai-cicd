import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.router import router

# Import all models so SQLAlchemy registers them before create_all
from app.api.models.orm import user, job, candidate, token_blacklist  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, lambda: Base.metadata.create_all(bind=engine))
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for AI Recruitment System",
    lifespan=lifespan,
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

# TODO: Include API routers
# from app.api import router as api_router
# app.include_router(api_router, prefix="/api/v1")

