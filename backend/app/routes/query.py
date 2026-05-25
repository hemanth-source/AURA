from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.retrieval_agent import retrieve_context
from app.agents.tutor_agent import tutor_response

router = APIRouter()


class Question(BaseModel):
    question: str


@router.post("/ask")
def ask_question(data: Question):

    results = retrieve_context(data.question)

    context = "\n".join([
        item.payload["text"] for item in results
    ])

    answer = tutor_response(data.question, context)

    return {
        "answer": answer
    }