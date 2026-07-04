import chromadb
from typing import List, Dict, Any

client = chromadb.HttpClient(host="localhost", port=8001)

COLLECTION_NAME = "documents"

collection = client.get_or_create_collection(
    name=COLLECTION_NAME
)


def add_documents(
    ids: List[str],
    documents: List[str],
    embeddings: List[List[float]],
    metadata: List[Dict[str, Any]] | None = None,
):
    try:
        collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadata if metadata else [{} for _ in ids],
        )
    except Exception as e:
        print("Error adding documents:", e)
        raise


def query_documents(
    query_embedding: List[float],
    n_results: int = 3,
    where: Dict[str, Any] | None = None,
):
    try:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where,
        )

        docs = results.get("documents", [])

        if docs and isinstance(docs[0], list):
            docs = docs[0]

        docs = list(dict.fromkeys(docs))

        return {
            "documents": docs,
            "raw": results,
        }

    except Exception as e:
        print("Error querying documents:", e)
        raise


def get_collection_metrics():
    count = collection.count()

    return {
        "documents": count,
        "chunks": count,
        "status": "ready",
    }

def delete_document_by_document_id(document_id: str):
    results = collection.get(
        where={
            "document_id": document_id,
        }
    )

    ids = results.get("ids", [])

    if not ids:
        return 0

    collection.delete(ids=ids)

    return len(ids)   