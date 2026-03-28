from sqlalchemy import text
from pydantic import UUID4
from sqlalchemy.orm import Session

def find_similarity(db, job_id: UUID4):
    query = text("""
        SELECT id,
               full_name,
               1 - (embedding <=> (SELECT embedding FROM jobs WHERE id = :job_id)) AS similarity
        FROM candidates
        WHERE job_id = :job_id
        ORDER BY embedding <=> (SELECT embedding FROM jobs WHERE id = :job_id)
        LIMIT 5;
    """)

    result = db.execute(query, {"job_id": str(job_id)}).fetchall()
    return result

def rank_candidates_for_job(db: Session, job_id: UUID4) -> list:
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