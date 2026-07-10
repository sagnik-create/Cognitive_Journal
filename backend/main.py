from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, journal, review
from services.auth_service import setup_auth_db
from services.cognee_service import setup as setup_cognee
from services.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_auth_db()
    await setup_cognee()
    yield


app = FastAPI(
    title="Cognitive Mirror API",
    description="Journal analysis, evolving memory, and thought review API.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(journal.router, prefix="/api", tags=["journal"])
app.include_router(review.router, prefix="/api", tags=["review"])


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "cognitive-mirror"}
