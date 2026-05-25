from openai import OpenAI
from app.config import GROQ_API_KEY

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def tutor_response(question, context):

    prompt = f"""
    You are a helpful study tutor named AURA. 
    Your goal is to answer the student's question.

    1. First, check if the student's question can be answered using the provided Context (which represents the lecture summary/content). If yes, answer it primarily using the Context.
    2. If the Context is empty, or if the Context does not contain enough information to answer the question, answer the student's question fully using your own general knowledge. In this case, gently note at the beginning of your response that the information is not explicitly in the uploaded lecture summary, but provide the complete and correct answer anyway.

    Context:
    {context}

    Question:
    {question}

    Explanation:
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