import requests
from google import genai
from google.genai import types

from core.config import (
    EMBEDDING_PROVIDER,
    GEMINI_API_KEY,
    DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL,
)


GEMINI_EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768


def _gemini_embed(texts: list[str], task_type: str):
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY no definida")

    client = genai.Client(api_key=GEMINI_API_KEY)

    result = client.models.embed_content(
        model=GEMINI_EMBEDDING_MODEL,
        contents=texts,
        config=types.EmbedContentConfig(
            task_type=task_type,
            output_dimensionality=EMBEDDING_DIMENSIONS,
        ),
    )

    return [embedding.values for embedding in result.embeddings]


def gemini_embed_documents(texts: list[str]):
    return _gemini_embed(texts, "RETRIEVAL_DOCUMENT")


def gemini_embed_query(texts: list[str]):
    return _gemini_embed(texts, "RETRIEVAL_QUERY")


def deepseek_embeddings(texts: list[str]):
    if not DEEPSEEK_API_KEY:
        raise Exception("DEEPSEEK_API_KEY no definida")

    response = requests.post(
        f"{DEEPSEEK_BASE_URL}/v1/embeddings",
        headers={
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "deepseek-embedding",
            "input": texts,
        },
        timeout=60,
    )

    data = response.json()

    if "data" not in data:
        print("DeepSeek embedding error:", data)
        raise Exception("DeepSeek embedding error")

    return [item["embedding"] for item in data["data"]]


# ✅ FIX: usa EMBEDDING_PROVIDER (independiente de LLM_PROVIDER).
# Nota: a la fecha, DeepSeek no expone una API pública de embeddings.
# deepseek_embeddings() queda aquí por si en el futuro la habilitan,
# pero EMBEDDING_PROVIDER debería mantenerse en "gemini" mientras tanto.
def embed_documents(texts: list[str]):
    if EMBEDDING_PROVIDER == "gemini":
        return gemini_embed_documents(texts)

    if EMBEDDING_PROVIDER == "deepseek":
        return deepseek_embeddings(texts)

    raise Exception(f"EMBEDDING_PROVIDER inválido: {EMBEDDING_PROVIDER}")


def embed_query(texts: list[str]):
    if EMBEDDING_PROVIDER == "gemini":
        return gemini_embed_query(texts)

    if EMBEDDING_PROVIDER == "deepseek":
        return deepseek_embeddings(texts)

    raise Exception(f"EMBEDDING_PROVIDER inválido: {EMBEDDING_PROVIDER}")


# Compatibilidad temporal si algún archivo viejo sigue importando embed_texts
def embed_texts(texts: list[str]):
    return embed_documents(texts)
