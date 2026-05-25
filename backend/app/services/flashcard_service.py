from openai import OpenAI
from app.config import GROQ_API_KEY

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def generate_flashcards(text):
    prompt = f"""
    Create exactly 5 flashcards from the following text.
    Return ONLY a valid JSON array of objects, with no markdown formatting or backticks.
    Each object must have "question" and "answer" string keys.
    
    Text:
    {text}
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content