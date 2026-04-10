from openai import OpenAI
from app.core.config import settings

def get_openai_client():
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not configured")
    return OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_embedding(text: str) -> list[float]:
    """
       Generate a 1536-dimensional embedding using the configured OpenAI model.
       This implementation is aligned with a Vector(1536) DB column.
    """
    client = get_openai_client()

    # Replace newlines, which can negatively affect performance.
    text = text.replace("\n", " ")
    
    response = client.embeddings.create(
        input=[text],
        model=settings.EMBEDDING_MODEL_NAME
    )
    
    return response.data[0].embedding
