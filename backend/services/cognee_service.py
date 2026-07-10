import asyncio
from datetime import datetime
from typing import Any

from services.config import settings

try:
    import cognee
except Exception:  # allows running without cognee installed
    cognee = None


# ----------------------------
# Setup
# ----------------------------
async def setup() -> None:
    await asyncio.sleep(0)


async def _call_cognee(func, *args, **kwargs):
    try:
        return await func(*args, **kwargs)
    except TypeError:
        kwargs.pop("dataset", None)
        kwargs.pop("dataset_name", None)
        kwargs.pop("datasets", None)
        return await func(*args, **kwargs)


def _dataset_for_user(user_id: str) -> str:
    safe_user_id = "".join(char if char.isalnum() or char in "-_" else "_" for char in user_id)
    return f"{settings.cognee_dataset}_user_{safe_user_id}"


# ----------------------------
# Helper: Convert dict → structured text
# ----------------------------
def _format_entry(data: dict[str, Any], user_id: str) -> str:
    """
    Convert structured journal data into text format
    optimized for Cognee ingestion + semantic recall
    """

    text = data.get("text", "")
    insights = data.get("insights", {})
    timestamp = data.get("timestamp", datetime.utcnow().isoformat())

    formatted = f"""
    [Journal Entry]
    User Namespace: {user_id}
    Timestamp: {timestamp}

    Raw Thought:
    {text}

    Personalized Analysis:
    - Summary: {insights.get("summary")}
    - Emotions: {insights.get("emotions")}
    - Patterns: {insights.get("patterns")}
    - Insights: {insights.get("insights")}
    - Suggestions: {insights.get("suggestions")}
    - Uniqueness Note: {insights.get("uniqueness_note")}
    """

    return formatted.strip()


# ----------------------------
# Store Memory
# ----------------------------
async def store_entry(data: dict[str, Any], user_id: str) -> None:
    if cognee is None:
        return

    try:
        formatted_text = _format_entry(data, user_id)

        await _call_cognee(cognee.remember, formatted_text, dataset_name=_dataset_for_user(user_id))

    except Exception as e:
        print("Error storing entry in Cognee:", e)


# ----------------------------
# Recall Memory
# ----------------------------
async def get_memory(query: str, user_id: str) -> Any:
    if cognee is None:
        return None

    try:
        scoped_query = f"Only recall memory from user namespace {user_id}. {query}"
        return await _call_cognee(
            cognee.recall,
            query_text=scoped_query,
            datasets=[_dataset_for_user(user_id)],
        )
    except Exception as e:
        print("Error during recall:", e)
        return None


# ----------------------------
# Improve Memory (Graph optimization)
# ----------------------------
async def improve_memory(user_id: str) -> None:
    if cognee is not None:
        try:
            await _call_cognee(cognee.improve, dataset=_dataset_for_user(user_id))
        except Exception as e:
            print("Error during improve:", e)

    await asyncio.sleep(0)


# ----------------------------
# Cleanup Memory (Retention policy)
# ----------------------------
async def cleanup_memory(user_id: str) -> None:
    if cognee is not None:
        try:
            await _call_cognee(cognee.forget, dataset=_dataset_for_user(user_id))
        except Exception as e:
            print("Error during cleanup:", e)

    await asyncio.sleep(0)
