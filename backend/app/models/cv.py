from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base


class CV(Base):
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String)
    extracted_text = Column(Text)
