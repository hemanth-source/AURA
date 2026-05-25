from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import upload, query, quiz, flashcards, analytics

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(query.router)
app.include_router(quiz.router)
app.include_router(flashcards.router)
app.include_router(analytics.router)

@app.get("/")
def home():
    return {"message": "AURA Backend Running"}