from fastapi import APIRouter, Depends

from services.gemini_service import generate_thought_review
from services.auth_service import get_current_user
from services.memory_manager import cleanup_old_entries, get_review_context, improve_long_term_memory


router = APIRouter()


@router.post("/review")
async def review_mind(current_user: dict = Depends(get_current_user)) -> dict:
    await cleanup_old_entries(current_user["id"])
    context = await get_review_context(user_id=current_user["id"], limit=50)
    review = await generate_thought_review(context)
    await improve_long_term_memory(current_user["id"])
    return {"review": review}
