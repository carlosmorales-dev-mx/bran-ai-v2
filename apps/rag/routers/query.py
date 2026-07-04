import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from services.embedder import embed_query
from services.retriever import query_documents
from services.llm.llm import generate_answer, stream_answer
from services.cache import make_key, get_cache, set_cache
from services.retry import (
    retry_model_call,
    is_quota_error,
    is_temporary_model_error,
)
from core.config import LLM_PROVIDER

router = APIRouter()

NO_CONTEXT_MESSAGE = "no tengo contexto de eso!"


def normalize_documents(value):
    if not value:
        return []

    if isinstance(value, list):
        docs = []

        for item in value:
            if isinstance(item, list):
                docs.extend([str(doc) for doc in item if doc])
            elif item:
                docs.append(str(item))

        return docs

    return [str(value)]


def retrieve_global_context(search_text: str):
    embedding = retry_model_call(
        lambda: embed_query([search_text])[0],
        attempts=2,
        delay_seconds=1,
        log_context="/query embedding",
    )

    results = query_documents(embedding)
    documents = normalize_documents(results.get("documents"))

    return [doc for doc in documents if doc.strip()]


def empty_response(question: str):
    return {
        "question": question,
        "context": [],
        "answer": NO_CONTEXT_MESSAGE,
        "usage": {
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
            "model": LLM_PROVIDER,
        },
        "cached": False,
        "ragOnly": True,
    }


@router.post("/query")
def query(data: dict):
    question = (data.get("question") or "").strip()
    search_text = (
        data.get("searchText")
        or data.get("search_text")
        or question
    ).strip()

    if not question:
        raise HTTPException(status_code=400, detail="question is required")

    if not search_text:
        return empty_response(question)

    global_context = retrieve_global_context(search_text)

    if not global_context:
        return empty_response(question)

    key = make_key(question, global_context)
    cached = get_cache(key)

    if cached:
        print("CACHE HIT")

        return {
            **cached,
            "cached": True,
            "usage": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
                "model": cached.get("usage", {}).get("model", LLM_PROVIDER),
                "cached": True,
            },
        }

    result = retry_model_call(
        lambda: generate_answer(question, global_context),
        attempts=3,
        delay_seconds=2,
        log_context="/query answer",
    )

    response = {
        "question": question,
        "context": global_context,
        "answer": result["text"],
        "usage": result["usage"],
        "cached": False,
        "ragOnly": True,
    }

    set_cache(key, response)

    return response


@router.post("/query/stream")
def query_stream(data: dict):
    question = (data.get("question") or "").strip()
    search_text = (
        data.get("searchText")
        or data.get("search_text")
        or question
    ).strip()

    if not question:
        raise HTTPException(status_code=400, detail="question is required")

    try:
        global_context = retrieve_global_context(search_text) if search_text else []

    except HTTPException as error:
        def error_generator():
            yield f"data: {json.dumps({'type': 'error', 'message': error.detail})}\n\n"

        return StreamingResponse(
            error_generator(),
            media_type="text/event-stream",
        )

    if not global_context:
        def no_context_generator():
            yield f"data: {json.dumps({'type': 'token', 'content': NO_CONTEXT_MESSAGE})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        return StreamingResponse(
            no_context_generator(),
            media_type="text/event-stream",
        )

    def event_generator():
        yield f"data: {json.dumps({'type': 'meta', 'provider': LLM_PROVIDER, 'context': global_context, 'ragOnly': True})}\n\n"

        try:
            for token in stream_answer(question, global_context):
                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as error:
            message = str(error)

            if is_quota_error(error):
                message = "Se alcanzó el límite temporal del modelo. Intenta más tarde."

            elif is_temporary_model_error(error):
                message = "El modelo está saturado temporalmente. Intenta de nuevo en unos segundos."

            yield f"data: {json.dumps({'type': 'error', 'message': message})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )