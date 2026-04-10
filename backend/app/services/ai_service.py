import json
import logging
from openai import OpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)
def get_openai_client():
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not configured")
    return OpenAI(api_key=settings.OPENAI_API_KEY)

def extract_candidate_data(raw_text: str) -> dict:
    client = get_openai_client()
    
    system_instruction = """
    You are an expert HR assistant. Your task is to extract structured information from the provided CV text.
    You must return ONLY a valid JSON object with the following keys:
    - "full_name": (string) The candidate's full name.
    - "email": (string) The candidate's email address.
    - "phone": (string or null) The candidate's phone number.
    - "skills": (array of strings) Key technical and soft skills identified.
    - "experience_total_months": (integer) Total months of professional experience and internships.
    - "education": (string) The highest education degree or most recent institution.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": f"CV Content:\n{raw_text[:4000]}"}
        ],
        temperature=0.0,
        response_format={"type": "json_object"}
    )

    try:
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        logger.error(f"Error parsing OpenAI response: {e}", exc_info=True)
        raise ValueError("Failed to parse candidate data from AI response") from e