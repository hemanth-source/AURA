import requests
import wave
import struct

# Create a tiny valid WAV file
def create_dummy_wav(filename):
    with wave.open(filename, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(44100)
        # write 1 second of silence
        for _ in range(44100):
            value = 0
            data = struct.pack('<h', value)
            w.writeframesraw(data)

create_dummy_wav('test_audio.wav')

# Test upload
url = "http://127.0.0.1:8000/upload"
with open('test_audio.wav', 'rb') as f:
    files = {'file': ('test_audio.wav', f, 'audio/wav')}
    response = requests.post(url, files=files)

print("Status Code:", response.status_code)
print("Response:", response.text)
