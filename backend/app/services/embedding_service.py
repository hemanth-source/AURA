import requests
import time
import os
import socket

# Force IPv4 resolution to bypass Linux container IPv6 DNS lookup issues
orig_getaddrinfo = socket.getaddrinfo
def my_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = my_getaddrinfo

API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
HF_TOKEN = os.getenv("HF_TOKEN")

def create_embedding(text):
    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"
        
    for attempt in range(5):
        try:
            response = requests.post(API_URL, json={"inputs": text}, headers=headers, timeout=15)
            
            if response.status_code in [429, 503]:
                time.sleep(3)
                continue
                
            data = response.json()
            
            # Handle Hugging Face model loading delay (cold start)
            if isinstance(data, dict) and "estimated_time" in data:
                wait_time = min(data.get("estimated_time", 5), 10)
                time.sleep(wait_time)
                continue
                
            if isinstance(data, list):
                if len(data) > 0 and isinstance(data[0], list):
                    return data[0]
                return data
                
            raise ValueError(f"Unexpected response format from Hugging Face: {data}")
        except Exception as e:
            if attempt == 4:
                raise e
            time.sleep(2)