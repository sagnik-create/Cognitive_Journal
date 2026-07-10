from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from services.auth_service import get_current_user
from services.gemini_service import analyze_journal, clean_journal_text
from services.memory_manager import create_entry, get_relevant_memory, list_entries


router = APIRouter()


class JournalCreate(BaseModel):
    raw_text: str = Field(..., min_length=1)


@router.post("/entries", status_code=status.HTTP_201_CREATED)
async def submit_entry(payload: JournalCreate, current_user: dict = Depends(get_current_user)) -> dict:
    text = clean_journal_text(payload.raw_text)
    if not text:
        raise HTTPException(status_code=400, detail="Journal entry cannot be empty.")

    memory_context = await get_relevant_memory(text, user_id=current_user["id"])
    insights = await analyze_journal(text, memory_context=memory_context)
    return await create_entry(text=text, insights=insights, user_id=current_user["id"])


@router.get("/entries")
async def get_entries(current_user: dict = Depends(get_current_user)) -> dict:
    return {"entries": await list_entries(user_id=current_user["id"])}
