from app.services.lyzr_service import generate_ai_response


def create_summary(text):

    prompt = f"""
    Summarize this lecture clearly.

    Lecture:
    {text}
    """

    return generate_ai_response(prompt)