from core.config import LLM_PROVIDER
from services.llm.gemini import gemini_chat, gemini_stream
from services.llm.deepseek import deepseek_chat, deepseek_stream


def generate_answer(question: str, context: list[str]):
    if not context:
        return {
            "text": "No tengo suficiente información para responder.",
            "usage": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
                "model": LLM_PROVIDER,
            },
        }

    if LLM_PROVIDER == "gemini":
        return gemini_chat(question, context)

    if LLM_PROVIDER == "deepseek":
        return deepseek_chat(question, context)

    raise Exception(f"LLM_PROVIDER inválido: {LLM_PROVIDER}")


def stream_answer(question: str, context: list[str]):
    if not context:
        yield "No tengo suficiente información para responder."
        return

    if LLM_PROVIDER == "gemini":
        yield from gemini_stream(question, context)
        return

    if LLM_PROVIDER == "deepseek":
        yield from deepseek_stream(question, context)
        return

    raise Exception(f"LLM_PROVIDER inválido: {LLM_PROVIDER}")