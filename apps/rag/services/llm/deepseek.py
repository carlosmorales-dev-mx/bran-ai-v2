import json
import requests
from core.config import (
    DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL,
    DEEPSEEK_MODEL,
)
from services.llm.rules import build_rag_prompt


def deepseek_chat(question: str, context: list[str]):
    if not DEEPSEEK_API_KEY:
        raise Exception("DEEPSEEK_API_KEY no definida")

    prompt = build_rag_prompt(question, context)

    response = requests.post(
        f"{DEEPSEEK_BASE_URL}/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": DEEPSEEK_MODEL,
            "messages": [
                {"role": "system", "content": "Eres Bran.ai."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
        },
        timeout=60,
    )

    data = response.json()

    if "choices" not in data:
        print("DeepSeek error:", data)
        raise Exception("DeepSeek API error")

    return {
        "text": data["choices"][0]["message"]["content"],
        "usage": {
            "prompt_tokens": data.get("usage", {}).get("prompt_tokens"),
            "completion_tokens": data.get("usage", {}).get("completion_tokens"),
            "total_tokens": data.get("usage", {}).get("total_tokens"),
            "model": DEEPSEEK_MODEL,
        },
    }


def deepseek_stream(question: str, context: list[str]):
    if not DEEPSEEK_API_KEY:
        raise Exception("DEEPSEEK_API_KEY no definida")

    prompt = build_rag_prompt(question, context)

    response = requests.post(
        f"{DEEPSEEK_BASE_URL}/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": DEEPSEEK_MODEL,
            "messages": [
                {"role": "system", "content": "Eres Bran.ai."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "stream": True,
            "stream_options": {
                "include_usage": True
            },
        },
        stream=True,
        timeout=60,
    )

    for line in response.iter_lines():
        if not line:
            continue

        decoded = line.decode("utf-8")

        if decoded.startswith("data: "):
            payload = decoded.replace("data: ", "")

            if payload == "[DONE]":
                break

            try:
                data = json.loads(payload)
                delta = data["choices"][0].get("delta", {})
                content = delta.get("content")

                if content:
                    yield content
            except Exception:
                continue