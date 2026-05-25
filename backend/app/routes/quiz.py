from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.quiz_agent import generate_quiz

router = APIRouter()


class QuizRequest(BaseModel):
    text: str


import json

@router.post("/quiz")
def create_quiz(data: QuizRequest):

    quiz_result = generate_quiz(data.text)
    
    try:
        quiz = json.loads(quiz_result)
    except:
        quiz = [{"question": "Error parsing quiz", "options": ["A", "B", "C", "D"], "answer": "A"}]

    return {
        "quiz": quiz
    }