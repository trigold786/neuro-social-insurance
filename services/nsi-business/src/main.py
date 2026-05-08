import logging
logging.basicConfig(level=logging.INFO)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .db import engine, Base
from .routers import profiles, calc, reports, scenarios
from .services.calc_service import close_shared_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await close_shared_client()
    await engine.dispose()

app = FastAPI(
    title="NSI Business Service",
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

app.include_router(profiles.router, prefix="/v1/profiles", tags=["Profiles"])
app.include_router(calc.router, prefix="/v1/calc", tags=["Calculation"])
app.include_router(reports.router, prefix="/v1/reports", tags=["Reports"])
app.include_router(scenarios.router, prefix="/v1/scenarios", tags=["Scenarios"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "nsi-business"}
