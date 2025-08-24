import requests
import os
import json

API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not API_KEY:
    raise ValueError("❌ No API key found. Please set DEEPSEEK_API_KEY environment variable.")

url = "https://api.deepseek.com/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "model": "deepseek-chat",  # ✅ use correct model name
    "messages": [{"role": "user", "content": "Hello from DeepSeek API!"}]
}

response = requests.post(url, headers=headers, json=data)

try:
    result = response.json()
except Exception:
    print("❌ Could not parse response:", response.text)
    exit()

if "choices" in result:
    print("✅ Response:", result["choices"][0]["message"]["content"])
else:
    print("❌ API returned an error:")
    print(json.dumps(result, indent=2))
