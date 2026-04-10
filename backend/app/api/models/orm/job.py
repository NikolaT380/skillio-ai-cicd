from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid
from app.core.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    company_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    requirements = Column(ARRAY(String), default=list)
    mandatory_criteria = Column(ARRAY(String), default=list)
    embedding = Column(Vector(1536))
    created_at = Column(DateTime(timezone=True), server_default=func.now())