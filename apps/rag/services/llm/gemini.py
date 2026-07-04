from google import genai
from core.config import GEMINI_API_KEY, GEMINI_MODEL
from services.llm.rules import build_rag_prompt


def gemini_chat(question: str, context: list[str]):
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY no definida")

    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = build_rag_prompt(question, context)

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
    )

    usage = getattr(response, "usage_metadata", None)

    return {
        "text": response.text,
        "usage": {
            "prompt_tokens": getattr(usage, "prompt_token_count", None),
            "completion_tokens": getattr(usage, "candidates_token_count", None),
            "total_tokens": getattr(usage, "total_token_count", None),
            "model": GEMINI_MODEL,
        },
    }


def gemini_stream(question: str, context: list[str]):
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY no definida")

    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = build_rag_prompt(question, context)

    stream = client.models.generate_content_stream(
        model=GEMINI_MODEL,
        contents=prompt,
    )

    for chunk in stream:
        text = getattr(chunk, "text", None)
        if text:
            yield text