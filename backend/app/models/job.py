from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base
from pgvector.sqlalchemy import Vector


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    embedding = Column(Vector(384))
