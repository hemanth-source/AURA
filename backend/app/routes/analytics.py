import json
import os
from fastapi import APIRouter

router = APIRouter()

ANALYTICS_FILE = "analytics.json"

def get_analytics():
    if not os.path.exists(ANALYTICS_FILE):
        return {
            "total_lectures": 0,
            "flashcards_reviewed": 0,
            "quizzes_taken": 0
        }
    with open(ANALYTICS_FILE, "r") as f:
        return json.load(f)

def update_analytics(key):
    data = get_analytics()
    if key in data:
        data[key] += 1
    with open(ANALYTICS_FILE, "w") as f:
        json.dump(data, f)

@router.get("/analytics")
def get_stats():
    return get_analytics()

@router.post("/analytics/increment/{key}")
def increment_stat(key: str):
    update_analytics(key)
    return {"status": "success"}
