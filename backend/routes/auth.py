from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, Depends, HTTPException, status

from services.auth_service import (
    authenticate_user,
    create_access_token,
    create_user,
    get_current_user,
    public_user,
)


router = APIRouter(prefix="/auth")


class AuthPayload(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


def _auth_response(user: dict) -> dict:
    return {
        "access_token": create_access_token(user),
        "token_type": "bearer",
        "user": public_user(user),
    }


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: AuthPayload) -> dict:
    user = create_user(payload.email, payload.password)
    return _auth_response(user)


@router.post("/login")
async def login(payload: AuthPayload) -> dict:
    user = authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return _auth_response(user)


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)) -> dict:
    return {"user": public_user(current_user)}
