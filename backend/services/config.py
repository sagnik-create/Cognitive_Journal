from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    # === Gemini (primary LLM) ===
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-1.5-flash"

    # === Generic LLM support (for flexibility later) ===
    llm_provider: str = "gemini"
    llm_model: str = "gemini/gemini-1.5-flash"
    llm_api_key: str | None = None

    # === Embeddings ===
    embedding_provider: str = "gemini"
    embedding_model: str = "gemini/gemini-embedding-001"
    embedding_api_key: str | None = None
    embedding_dimensions: int = 768

    # === App Config ===
    cognee_dataset: str = "project_memory"
    frontend_origin: str = "http://localhost:5173"
    frontend_origins: str = ""
    local_memory_path: str = "./data/memory.json"
    users_db_path: str = "./data/users.db"
    jwt_secret_key: str = "change-me-in-production-use-a-strong-random-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7
    llm_debug_logging: bool = True

    @property
    def cors_origins(self) -> list[str]:
        origins = [
            *self._split_origins(self.frontend_origin),
            *self._split_origins(self.frontend_origins),
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        return list(dict.fromkeys(origins))

    @staticmethod
    def _split_origins(value: str) -> list[str]:
        return [
            origin
            for origin in (part.strip() for part in value.split(","))
            if origin.startswith(("http://", "https://"))
        ]

    # === Pydantic config ===
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False  # 🔥 prevents crashes from unexpected env vars
    )


settings = Settings()
