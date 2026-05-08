import logging
logging.basicConfig(level=logging.INFO)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .db import engine, Base
from .routers import policies, ocr

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title="NSI Policy Hub",
    version="1.0.1",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:30300", "http://localhost:30301", "http://localhost:30310"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(policies.router, prefix="/v1/policies", tags=["Policies"])
app.include_router(ocr.router, prefix="/v1/ocr", tags=["OCR"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "policy-hub"}
