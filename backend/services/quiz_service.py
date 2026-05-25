from app.services.lyzr_service import generate_ai_response


def create_quiz(text):

    prompt = f"""
    Generate 5 MCQ questions from this lecture.

    Lecture:
    {text}
    """

    return generate_ai_response(prompt)