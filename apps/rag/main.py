from fastapi import FastAPI
from routers.health import router as health_router
from routers.ingest import router as ingest_router
from routers.query import router as query_router
from routers import metrics

app = FastAPI()

app.include_router(health_router)
app.include_router(ingest_router)
app.include_router(query_router)
app.include_router(metrics.router)

@app.get("/")
def root():
    return {"message": "RAG service running 🚀"}