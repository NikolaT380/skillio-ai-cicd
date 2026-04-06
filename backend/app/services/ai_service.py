import json
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def extract_candidate_data(raw_text: str) -> dict:
    prompt = f"""
    You are an expert HR assistant. Extract the following information from the given CV text.
    Return ONLY a valid JSON object with the exact keys below. Do not add markdown blocks like ```json.

    Keys:
    - "full_name": (string, candidate's name)
    - "email": (string, candidate's email)
    - "phone": (string, candidate's phone number, or null)
    - "skills": (array of strings, key skills)
    - "experience_total_months": (integer, total months of professional experience/internships. Be thorough in counting.)
    - "education": (string, highest education degree/institution)

    CV Text:
    {raw_text[:4000]} # Increased limit slightly for better context
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0
    )

    try:
        content = response.choices[0].message.content.strip()
        # sometimes OpenAI adds markdown json block even if told not to
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
        return json.loads(content)
    except Exception as e:
        print(f"Error parsing OpenAI response: {e}")
        return {
            "full_name": "Unknown",
            "email": "unknown@example.com",
            "phone": None,
            "skills": [],
            "experience_total_months": 0,
            "education": "Unknown"
        }