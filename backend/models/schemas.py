from pydantic import BaseModel


class QuestionRequest(BaseModel):
    question: str


class QuizRequest(BaseModel):
    text: str


class SummaryResponse(BaseModel):
    transcript: str
    summary: str