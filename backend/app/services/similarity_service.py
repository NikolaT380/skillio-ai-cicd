from sqlalchemy import text

def find_similarity(db, job_id):
    query = text("""
        SELECT id, 1 - (embedding <=> (SELECT embedding FROM jobs WHERE id = :job_id)) AS similarity
        FROM cvs
        ORDER BY embedding <=> (SELECT embedding FROM jobs WHERE id = :job_id)
        LIMIT 5;
    """)

    result = db.execute(query, {"job_id": job_id}).fetchall()
    return result
