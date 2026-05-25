from openai import OpenAI
from app.config import GROQ_API_KEY

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def generate_quiz(text):

    prompt = f"""
    Generate exactly 3 multiple choice questions from this lecture text.
    Return ONLY a valid JSON array of objects, with no markdown formatting or backticks.
    Each object must have:
    - "question" (string)
    - "options" (array of 4 strings)
    - "answer" (string, must exactly match one of the options)

    Lecture:
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