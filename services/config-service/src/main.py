import logging
logging.basicConfig(level=logging.INFO)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .db import engine, Base
from .routers import configs
from .services import config_service
from .db import AsyncSessionLocal

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # 初始化默认配置
    async with AsyncSessionLocal() as session:
        await config_service.seed_defaults(session)
        await session.commit()
    yield
    await engine.dispose()

app = FastAPI(
    title="NSI Config Service",
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

app.include_router(configs.router, prefix="/v1/configs", tags=["Configs"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "config-service", "version": "1.0.2"}
