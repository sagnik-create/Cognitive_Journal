import json
import logging
import re
from typing import Any, TypeVar

import google.generativeai as genai
from pydantic import BaseModel, ValidationError

from services.config import settings
from services.schemas import JournalInsights, ThoughtReview


T = TypeVar("T", bound=BaseModel)
logger = logging.getLogger("cognitive_mirror.llm")

JOURNAL_PROMPT = """
You are Cognitive Mirror, a reflective AI psychologist analyzing one private journal entry
for this specific user. Return only strict JSON.

Your job:
- Identify emotional nuance, including mixed or indirect feelings.
- Detect behavioral and thinking patterns over time from the supplied user memory.
- Connect today's entry to past reflections when the connection is supported by context.
- Notice what is different, new, stronger, quieter, or unresolved today.
- Avoid repeating previous insights unless the recurrence itself is important.
- Be concrete. Refer to details from today's entry and memory context.
- Do NOT give generic advice, common wellness phrases, or template-like summaries.
- Do NOT invent history that is not present in the memory context.

Return exactly this JSON shape:
{
  "summary": "...",
  "emotions": [],
  "patterns": ["..."],
  "insights": ["..."],
  "suggestions": ["..."],
  "uniqueness_note": "..."
}

No markdown. No prose outside JSON.
Use empty arrays only when there is genuinely no signal.
"""

REVIEW_PROMPT = """
You are building a long-term psychological thought review from journal memory.
Focus on recurring patterns, behavioral loops, emotional cycles, constructive weaknesses,
personality tendencies, and specific actionable growth suggestions.

Return exactly this JSON shape:
{
  "patterns": [],
  "weaknesses": [],
  "personality": [],
  "emotional_cycles": [],
  "behavior_loops": [],
  "growth_suggestions": []
}

Avoid generic advice. No markdown. No prose outside JSON.
Memory context:
"""


def _model():
    if not settings.gemini_api_key:
        return None
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(settings.gemini_model)


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()
    return json.loads(cleaned)


def clean_journal_text(text: Any) -> str:
    if isinstance(text, dict):
        text = text.get("text") or text.get("raw_text") or json.dumps(text, ensure_ascii=True)
    cleaned = re.sub(r"\s+", " ", str(text)).strip()
    if not cleaned:
        return ""

    sentences = re.split(r"(?<=[.!?])\s+", cleaned)
    deduped_sentences = []
    seen_sentences = set()
    for sentence in sentences:
        normalized = sentence.strip().lower()
        if normalized and normalized not in seen_sentences:
            deduped_sentences.append(sentence.strip())
            seen_sentences.add(normalized)

    words = " ".join(deduped_sentences).split()
    deduped_words = []
    for word in words:
        if len(deduped_words) >= 2 and word.lower() == deduped_words[-1].lower() == deduped_words[-2].lower():
            continue
        deduped_words.append(word)
    return " ".join(deduped_words)


def _debug_log(label: str, value: Any) -> None:
    if settings.llm_debug_logging:
        logger.warning("%s: %s", label, value)


def _build_journal_prompt(text: str, memory_context: dict[str, Any]) -> str:
    context = {
        "recent_entries": memory_context.get("recent_entries", []),
        "personality_model": memory_context.get("personality_model", {}),
        "cognee_recall": memory_context.get("cognee_recall", ""),
    }
    return (
        JOURNAL_PROMPT
        + "\nPast reflections from this same authenticated user:\n"
        + json.dumps(context, ensure_ascii=True, indent=2)
        + "\n\nToday's cleaned journal entry:\n"
        + text
        + "\n\nAnalyze how today's entry connects with past patterns. Each response must be unique to this entry."
    )


async def _generate_json(prompt: str, schema: type[T], fallback: T) -> T:
    model = _model()
    if model is None:
        _debug_log("LLM fallback used because Gemini API key is missing", fallback.model_dump())
        return fallback

    last_error: Exception | None = None
    for _ in range(2):
        try:
            response = await model.generate_content_async(
                prompt,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.25,
                },
            )
            data = _extract_json(response.text)
            result = schema.model_validate(data)
            _debug_log("LLM final output", result.model_dump())
            return result
        except (json.JSONDecodeError, ValidationError, ValueError) as exc:
            last_error = exc
            prompt += "\nReturn valid strict JSON only. Fix schema errors."

    raise ValueError(f"Gemini returned invalid JSON: {last_error}")


def _fallback_insights(text: str) -> JournalInsights:
    words = text.lower()
    emotions = []
    for cue, label in [
        ("anxious", "anxiety"),
        ("stuck", "frustration"),
        ("tired", "fatigue"),
        ("happy", "contentment"),
        ("angry", "anger"),
        ("worried", "worry"),
    ]:
        if cue in words:
            emotions.append(label)

    return JournalInsights(
        summary=f"This entry centers on {text[:140].strip()}",
        emotions=emotions or ["reflective"],
        patterns=["The writer is observing their own internal state rather than only describing events."],
        insights=["This may be an early signal; stronger personalization will emerge as more entries accumulate."],
        suggestions=["Add one concrete detail about what happened before and after this feeling."],
        uniqueness_note="This note is based only on the current entry because no model response was available.",
    )


def _fallback_review(context: dict[str, Any]) -> ThoughtReview:
    entries = context.get("entries", [])
    common_emotions = []
    for entry in entries:
        common_emotions.extend(entry.get("insights", {}).get("emotions", []))

    return ThoughtReview(
        patterns=["You repeatedly return to self-reflection and meaning-making."],
        weaknesses=["Stress signals may become clearer after more entries are added."],
        personality=["Introspective", "Pattern-seeking", "Growth-oriented"],
        emotional_cycles=list(dict.fromkeys(common_emotions))[:5] or ["Reflective"],
        behavior_loops=["Journal, notice a concern, search for a more workable response."],
        growth_suggestions=[
            "After each entry, name one next action that is small enough to complete today."
        ],
    )


async def analyze_journal(text: str, memory_context: dict[str, Any] | None = None) -> dict[str, Any]:
    cleaned_text = clean_journal_text(text)
    memory_context = memory_context or {}
    prompt = _build_journal_prompt(cleaned_text, memory_context)
    _debug_log("Retrieved memory context", memory_context)
    _debug_log("LLM input prompt", prompt)
    insights = await _generate_json(
        prompt,
        JournalInsights,
        _fallback_insights(cleaned_text),
    )
    return insights.model_dump()


async def generate_thought_review(context: dict[str, Any]) -> dict[str, Any]:
    prompt = REVIEW_PROMPT + json.dumps(context, ensure_ascii=True)
    _debug_log("Review memory context", context)
    _debug_log("Review LLM input prompt", prompt)
    review = await _generate_json(
        prompt,
        ThoughtReview,
        _fallback_review(context),
    )
    return review.model_dump()
