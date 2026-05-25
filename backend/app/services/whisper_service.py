from openai import OpenAI
from app.config import GROQ_API_KEY

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def transcribe_audio(file_path):
    audio_file = open(file_path, "rb")

    transcript = client.audio.transcriptions.create(
        model="whisper-large-v3",
        file=audio_file
    )

    return transcript.text