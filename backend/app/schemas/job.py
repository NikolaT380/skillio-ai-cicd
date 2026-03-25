from pydantic import BaseModel
from typing import List


class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    embedding: List[float]

    class Config:
        from_attributes = True
