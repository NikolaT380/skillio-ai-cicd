from pydantic import BaseModel
from typing import List


class CVResponse(BaseModel):
    id: int
    file_path: str
    extracted_text: str
    embedding: List[float]

    class Config:
        from_attributes = True
