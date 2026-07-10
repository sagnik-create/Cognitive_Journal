import json
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any
from uuid import uuid4

from services import cognee_service
from services.config import settings
from services.schemas import PersonalityModel


def _safe_user_id(user_id: str) -> str:
    return "".join(char if char.isalnum() or char in "-_" else "_" for char in user_id)


def _memory_path(user_id: str) -> Path:
    base_path = Path(settings.local_memory_path)
    path = base_path.parent / "users" / _safe_user_id(user_id) / base_path.name
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def _read_store(user_id: str) -> dict[str, Any]:
    path = _memory_path(user_id)
    if not path.exists():
        return {"entries": [], "personality_model": PersonalityModel().model_dump()}
    return json.loads(path.read_text(encoding="utf-8"))


def _write_store(store: dict[str, Any], user_id: str) -> None:
    _memory_path(user_id).write_text(json.dumps(store, indent=2), encoding="utf-8")


def _entry_title(text: str, insights: dict[str, Any]) -> str:
    emotion = next(iter(insights.get("emotions", [])), "Reflective")
    first_words = " ".join(text.split()[:5])
    return f"{emotion.title()} - {first_words}".strip()


async def create_entry(text: str, insights: dict[str, Any], user_id: str) -> dict[str, Any]:
    store = _read_store(user_id)
    timestamp = datetime.now(UTC).isoformat()
    entry = {
        "entry_id": str(uuid4()),
        "timestamp": timestamp,
        "text": text,
        "raw_text": text,
        "title": _entry_title(text, insights),
        "insights": insights,
    }
    store["entries"].insert(0, entry)
    _write_store(store, user_id)

    await cognee_service.store_entry(
        {
            "entry_id": entry["entry_id"],
            "timestamp": timestamp,
            "text": text,
            "insights": insights,
            "relationships": [
                "User -> Entry",
                "Entry -> Emotions",
                "Entry -> Patterns",
                "Entry -> Personalized Insights",
                "Entry -> Suggestions",
            ],
        },
        user_id=user_id,
    )

    if len(store["entries"]) % 3 == 0:
        await improve_long_term_memory(user_id)

    return entry


async def list_entries(user_id: str) -> list[dict[str, Any]]:
    await cognee_service.get_memory("recent journal entries grouped by date", user_id=user_id)
    return _read_store(user_id).get("entries", [])


async def get_relevant_memory(text: str, user_id: str, limit: int = 8) -> dict[str, Any]:
    store = _read_store(user_id)
    recent_entries = store.get("entries", [])[:limit]
    cognee_memory = await cognee_service.get_memory(
        f"past reflections emotionally or thematically related to this entry: {text[:1200]}",
        user_id=user_id,
    )
    return {
        "recent_entries": recent_entries,
        "personality_model": store.get("personality_model", {}),
        "cognee_recall": str(cognee_memory) if cognee_memory is not None else "",
    }


async def get_review_context(user_id: str, limit: int = 50) -> dict[str, Any]:
    store = _read_store(user_id)
    cognee_memory = await cognee_service.get_memory(
        "recent entries, emotions, personalized insights, patterns, suggestions, and recurring topics",
        user_id=user_id,
    )
    return {
        "entries": store.get("entries", [])[:limit],
        "personality_model": store.get("personality_model", {}),
        "cognee_recall": str(cognee_memory) if cognee_memory is not None else "",
    }


async def improve_long_term_memory(user_id: str) -> None:
    store = _read_store(user_id)
    entries = store.get("entries", [])
    patterns = set()
    emotions = set()
    insights_seen = set()
    suggestions = set()

    for entry in entries:
        insights = entry.get("insights", {})
        patterns.update(insights.get("patterns", []))
        emotions.update(insights.get("emotions", []))
        insights_seen.update(insights.get("insights", []))
        suggestions.update(insights.get("suggestions", []))

    store["personality_model"] = PersonalityModel(
        traits=sorted(insights_seen)[:12],
        dominant_patterns=sorted(patterns)[:12],
        emotional_tendencies=sorted(emotions)[:12],
        cognitive_biases=[],
        confidence_profile=sorted(suggestions)[:12],
    ).model_dump()
    _write_store(store, user_id)
    await cognee_service.improve_memory(user_id)


async def cleanup_old_entries(user_id: str) -> None:
    store = _read_store(user_id)
    cutoff = datetime.now(UTC) - timedelta(days=365)
    entries = []
    for entry in store.get("entries", []):
        timestamp = datetime.fromisoformat(entry["timestamp"])
        if timestamp >= cutoff:
            entries.append(entry)

    if len(entries) != len(store.get("entries", [])):
        store["entries"] = entries
        _write_store(store, user_id)

    await cognee_service.cleanup_memory(user_id)
