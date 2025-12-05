from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from ..models import LoginRequest, SignupRequest, AuthResponse, User, ApiResponse
from ..database import db

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    # Mock token validation: token is just the email for simplicity in this mock
    # In a real app, verify JWT here
    user = db.get_user_by_email(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    if not db.verify_password(request.email, request.password):
        return AuthResponse(success=False, error="Invalid credentials")
    
    user = db.get_user_by_email(request.email)
    # In a real app, return a JWT token here. 
    # For this mock, the client will use the email as the token (simulated)
    # But wait, the frontend expects a 'User' object in response, and likely stores it.
    # The OpenAPI spec for AuthResponse returns 'user'.
    # The Bearer token is usually separate.
    # However, for this mock, we'll just return the user.
    # The frontend likely doesn't send a token yet if it was using localStorage mock.
    # But the spec says 'security: bearerAuth'.
    # We will assume the client sends 'Authorization: Bearer <email>' for now if we want to test it.
    
    return AuthResponse(success=True, user=user)

@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(request: SignupRequest):
    user = db.create_user(request.email, request.username, request.password)
    if not user:
        return AuthResponse(success=False, error="User already exists")
    
    return AuthResponse(success=True, user=user)

@router.post("/logout", response_model=ApiResponse[None])
async def logout(current_user: Annotated[User, Depends(get_current_user)]):
    return ApiResponse(success=True)

@router.get("/me", response_model=ApiResponse[User])
async def me(current_user: Annotated[User, Depends(get_current_user)]):
    return ApiResponse(success=True, data=current_user)
