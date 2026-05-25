from fastapi import APIRouter, UploadFile, File
import shutil
import uuid

from app.services.whisper_service import transcribe_audio
from app.agents.summary_agent import generate_summary
from app.agents.memory_agent import store_memory

router = APIRouter()


import traceback

@router.post("/upload")
async def upload_lecture(file: UploadFile = File(...)):
    try:
        import os
        os.makedirs("temp", exist_ok=True)
        file_location = f"temp/{file.filename}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        transcript = transcribe_audio(file_location)

        summary = generate_summary(transcript)

        lecture_id = str(uuid.uuid4())

        store_memory(transcript, lecture_id)

        return {
            "transcript": transcript,
            "summary": summary
        }
    except Exception as e:
        return {
            "error_detail": str(e),
            "traceback": traceback.format_exc()
        }


@router.post("/transcribe")
async def transcribe_voice(file: UploadFile = File(...)):
    import os
    os.makedirs("temp", exist_ok=True)
    file_location = f"temp/voice_{uuid.uuid4()}.wav"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    transcript = transcribe_audio(file_location)

    try:
        os.remove(file_location)
    except Exception:
        pass

    return {
        "text": transcript
    }