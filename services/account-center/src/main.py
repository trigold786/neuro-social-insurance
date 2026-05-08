import logging
logging.basicConfig(level=logging.INFO)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .db import engine, Base
from .routers import auth, users, orgs, deletion

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title="NSI Account Center",
    version="1.0.2",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:30300", "http://localhost:30301", "http://localhost:30310"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/v1/users", tags=["Users"])
app.include_router(orgs.router, prefix="/v1/orgs", tags=["Organizations"])
app.include_router(deletion.router, prefix="/v1/users", tags=["Account Deletion"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "account-center", "version": "1.0.2"}
