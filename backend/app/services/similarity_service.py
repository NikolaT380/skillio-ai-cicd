from sqlalchemy import text
from pydantic import UUID4

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
