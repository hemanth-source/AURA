import requests
import time
import os
import socket

# Force IPv4 resolution to bypass Linux container IPv6 DNS lookup issues
orig_getaddrinfo = socket.getaddrinfo
def my_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = my_getaddrinfo

HF_TOKEN = os.getenv("HF_TOKEN")

def resolve_hf_ip():
    """Resolve api-inference.huggingface.co via Google or Cloudflare DoH direct IPs to bypass local DNS bootstrap failures."""
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    # Try Google DoH direct via IP (8.8.8.8)
    try:
        headers = {"Host": "dns.google"}
        r = requests.get(
            "https://8.8.8.8/resolve?name=api-inference.huggingface.co&type=A",
            headers=headers,
            verify=False,
            timeout=4
        )
        if r.status_code == 200:
            data = r.json()
            if "Answer" in data and len(data["Answer"]) > 0:
                return data["Answer"][0]["data"]
    except Exception:
        pass

    # Try Cloudflare DoH direct via IP fallback (1.1.1.1)
    try:
        headers = {"Host": "cloudflare-dns.com", "accept": "application/dns-json"}
        r = requests.get(
            "https://1.1.1.1/dns-query?name=api-inference.huggingface.co&type=A",
            headers=headers,
            verify=False,
            timeout=4
        )
        if r.status_code == 200:
            data = r.json()
            if "Answer" in data and len(data["Answer"]) > 0:
                return data["Answer"][0]["data"]
    except Exception:
        pass
        
    return None

def create_embedding(text):
    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"
        
    # Dynamically resolve HF endpoint IP via DoH to sidestep network DNS failures on Render
    ip = resolve_hf_ip()
    if ip:
        url = f"https://{ip}/models/sentence-transformers/all-MiniLM-L6-v2"
        headers["Host"] = "api-inference.huggingface.co"
        # Disable SSL warnings since we are using IP address directly
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        verify_ssl = False
    else:
        url = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
        verify_ssl = True
        
    for attempt in range(5):
        try:
            response = requests.post(
                url, 
                json={"inputs": text}, 
                headers=headers, 
                timeout=15,
                verify=verify_ssl
            )
            
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