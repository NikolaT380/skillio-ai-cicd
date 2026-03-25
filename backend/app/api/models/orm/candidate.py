from sqlalchemy import Column, String, Text, Integer, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid
from app.core.database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"))
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    skills = Column(ARRAY(String), default=list)
    experience_years = Column(Integer, default=0)
    education = Column(Text)
    cv_url = Column(String)
    raw_text = Column(Text)
    embedding = Column(Vector(1536))
    match_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())