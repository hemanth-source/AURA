from fastapi import APIRouter
from pydantic import BaseModel
import json

from app.services.flashcard_service import generate_flashcards

router = APIRouter()

class FlashcardRequest(BaseModel):
    text: str

@router.post("/flashcards")
def flashcards(data: FlashcardRequest):
    result = generate_flashcards(data.text)
    
    try:
        cards = json.loads(result)
    except:
        cards = [{"question": "Error parsing flashcards", "answer": result}]
        
    return {
        "flashcards": cards
    }