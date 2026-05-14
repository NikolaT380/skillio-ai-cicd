from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional
from pydantic import UUID4
from datetime import datetime

# This model defines the output structure after a candidate's CV has been processed

class CandidateExtract(BaseModel):
    """Schema for validating data extracted by the AI service."""
    full_name: Optional[str] = Field(default="Unknown")
    email: Optional[str] = Field(default="unknown@example.com")
    phone: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience_total_months: int = 0
    education: Optional[str] = None

    @field_validator('full_name', mode='before')
    @classmethod
    def default_full_name(cls, v):
        return v if isinstance(v, str) and v.strip() else "Unknown"

    @field_validator('email', mode='before')
    @classmethod
    def default_email(cls, v):
        return v if isinstance(v, str) and v.strip() else "unknown@example.com"

    @field_validator('skills', mode='before')
    @classmethod
    def default_skills(cls, v):
        return v if isinstance(v, list) else []

    @field_validator('experience_total_months', mode='before')
    @classmethod
    def default_experience(cls, v):
        return v if isinstance(v, int) else 0

class CandidateResponse(BaseModel): # represents a parsed candidate profile linked to a specific job
    id: UUID4
    job_id: UUID4
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience_years: int = 0
    education: Optional[str] = None
    cv_url: Optional[str] = None
    match_score: float = 0.0
    status: Optional[str] = None
    created_at: datetime
    # We omit the 'raw_text' and 'embedding' from the response.
    # The frontend only needs the extracted data and the match_score.

    class Config:
        from_attributes = True

# Note: We do NOT need a CandidateCreate schema yet.
# Why? Because candidates are created via a multipart/form-data File Upload
# (a PDF file), not a JSON body POST request! 
# The AI service will generate the candidate object from the uploaded PDF.
