from fastapi import APIRouter
import chromadb

router = APIRouter()

client = chromadb.HttpClient(host="localhost", port=8001)
collection = client.get_or_create_collection(name="documents")


@router.get("/metrics")
def get_metrics():
    count = collection.count()

    return {
        "documents": count,   # simple (luego lo mejoras)
        "chunks": count,
        "status": "ready"
    }