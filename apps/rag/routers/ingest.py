from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, HTTPException

from services.chunker import chunk_text
from services.embedder import embed_documents
from services.retriever import add_documents, delete_document_by_document_id
from services.retry import retry_model_call
from parsers.file_parser import parse_uploaded_file, detect_type

router = APIRouter()

MAX_UPLOAD_BYTES = 100 * 1024 * 1024


# ── Core indexing helpers ──────────────────────────────────────────────────────

def index_text(
    title: str,
    content: str,
    doc_type: str = "text",
    source: str = "manual",
):
    clean_title = title.strip() or "Documento manual"
    clean_content = content.strip()

    if not clean_content:
        raise HTTPException(status_code=400, detail="content is required")

    chunks = chunk_text(clean_content)

    if not chunks:
        raise HTTPException(status_code=400, detail="No indexable text found")

    embeddings = retry_model_call(
        lambda: embed_documents(chunks),
        quota_detail=(
            "Se alcanzó el límite temporal del modelo para procesar archivos. "
            "Intenta más tarde o usa otra API key/modelo."
        ),
        log_context="/ingest",
    )

    document_id = str(uuid4())

    ids = [f"{document_id}-{i}" for i in range(len(chunks))]

    metadatas = [
        {
            "document_id": document_id,
            "title": clean_title,
            "type": doc_type,
            "source": source,
            "chunk_index": i,
        }
        for i in range(len(chunks))
    ]

    add_documents(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadata=metadatas,
    )

    return {
        "status": "indexed",
        "document_id": document_id,
        "chunks": len(chunks),
        "type": doc_type,
        "source": source,
    }


def extract_file_text(file_name: str, content: bytes, mime_type: str | None):
    text = parse_uploaded_file(
        filename=file_name,
        content=content,
        mime_type=mime_type,
    )

    if not text or not text.strip():
        raise HTTPException(
            status_code=400,
            detail="No text could be extracted from file",
        )

    return text.strip()


async def read_upload_file(file: UploadFile) -> bytes:
    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Empty file",
        )

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="File too large. Max 100MB.",
        )

    return content


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/ingest")
async def ingest_text(data: dict):
    title = (data.get("title") or "").strip()
    content = (data.get("content") or "").strip()
    source = (data.get("source") or "manual").strip()
    doc_type = (data.get("type") or "text").strip()

    if not content:
        raise HTTPException(status_code=400, detail="content is required")

    return index_text(title, content, doc_type, source)


@router.post("/ingest/file")
async def ingest_file(file: UploadFile = File(...)):
    content = await read_upload_file(file)

    file_type = detect_type(file.filename or "")

    text = extract_file_text(
        file_name=file.filename or "upload",
        content=content,
        mime_type=file.content_type,
    )

    result = index_text(
        title=file.filename or "Archivo subido",
        content=text,
        doc_type=file_type,
        source="upload",
    )

    # ✅ NUEVO: devolvemos el texto extraído para que el backend lo guarde
    # en Postgres (Document.extractedText). Sin esto no hay forma de
    # reindexar el documento después sin volver a subir el archivo.
    result["extractedText"] = text

    return result


@router.post("/extract/file")
async def extract_file_endpoint(file: UploadFile = File(...)):
    """
    Extrae texto de un archivo sin indexarlo en ChromaDB.
    Usado por chat/upload para análisis en contexto.
    """
    content = await read_upload_file(file)

    text = extract_file_text(
        file_name=file.filename or "upload",
        content=content,
        mime_type=file.content_type,
    )

    preview_chunks = chunk_text(text)

    return {
        "extractedText": text,
        "chunks": len(preview_chunks),
        "filename": file.filename,
        "type": detect_type(file.filename or ""),
    }


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """
    Elimina todos los chunks de un documento de ChromaDB por su document_id.
    """
    deleted_count = delete_document_by_document_id(document_id)

    return {
        "status": "deleted",
        "document_id": document_id,
        "deleted_chunks": deleted_count,
    }
