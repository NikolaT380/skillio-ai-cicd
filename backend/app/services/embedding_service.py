from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_embedding(text: str) -> list[float]:
    """

       Generate a 1536-dimensional embedding using the configured OpenAI model.
       This implementation is aligned with a Vector(1536) DB column.

    """

    # Replace newlines, which can negatively affect performance.
    text = text.replace("\n", " ")
    
    response = client.embeddings.create(
        input=[text],
        model=settings.EMBEDDING_MODEL_NAME
    )
    
    return response.data[0].embedding
