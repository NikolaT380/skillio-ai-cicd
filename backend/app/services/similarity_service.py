from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import UUID4

def rank_candidates_for_job(db: Session, job_id: UUID4) -> list:
    """
    Calculate the cosine similarity between a specific job and all candidates linked to it.
    Returns a list of result rows containing candidate ID and similarity score.
    """
    query = text("""
        SELECT id,
               1 - (embedding <=> (SELECT embedding FROM jobs WHERE id = :job_id)) AS similarity
        FROM candidates
        WHERE job_id = :job_id
          AND embedding IS NOT NULL
        ORDER BY similarity DESC
    """)
    results = db.execute(query, {"job_id": job_id}).fetchall()
    return results
