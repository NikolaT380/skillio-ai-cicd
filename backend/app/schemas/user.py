from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

# These models handle user authentication and management.

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str # the password will be hashed before storage

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True # allows Pydantic to read data directly from the SQLAlchemy ORM model
