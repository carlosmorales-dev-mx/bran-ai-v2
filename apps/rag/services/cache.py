from hashlib import sha256
from time import time
from typing import Any

CACHE: dict[str, dict[str, Any]] = {}

DEFAULT_TTL_SECONDS = 60 * 10  # 10 minutos


def make_key(question: str, context: list[str]) -> str:
    normalized_question = question.strip().lower()
    normalized_context = "\n".join([c.strip() for c in context if c])

    raw = f"{normalized_question}||{normalized_context}"

    return sha256(raw.encode("utf-8")).hexdigest()


def get_cache(key: str):
    item = CACHE.get(key)

    if not item:
        return None

    expires_at = item.get("expires_at")

    if expires_at and expires_at < time():
        CACHE.pop(key, None)
        return None

    return item.get("value")


def set_cache(key: str, value, ttl_seconds: int = DEFAULT_TTL_SECONDS):
    CACHE[key] = {
        "value": value,
        "expires_at": time() + ttl_seconds,
    }