from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import LoginRequest, SignupRequest, AuthResponse, User, ApiResponse
from ..database import get_db, create_user, get_user_by_email, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_db)
):
    # Mock token validation: token is just the email for simplicity in this mock
    # In a real app, verify JWT here
    user = await get_user_by_email(session, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, session: AsyncSession = Depends(get_db)):
    if not await verify_password(session, request.email, request.password):
        return AuthResponse(success=False, error="Invalid credentials")
    
    user = await get_user_by_email(session, request.email)
    # In a real app, return a JWT token here. 
    # For this mock, the client will use the email as the token (simulated)
    
    return AuthResponse(success=True, user=user)

@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(request: SignupRequest, session: AsyncSession = Depends(get_db)):
    user = await create_user(session, request.email, request.username, request.password)
    if not user:
        return AuthResponse(success=False, error="User already exists")
    
    return AuthResponse(success=True, user=user)

@router.post("/logout", response_model=ApiResponse[None])
async def logout(current_user: Annotated[User, Depends(get_current_user)]):
    return ApiResponse(success=True)

@router.get("/me", response_model=ApiResponse[User])
async def me(current_user: Annotated[User, Depends(get_current_user)]):
    return ApiResponse(success=True, data=current_user)
