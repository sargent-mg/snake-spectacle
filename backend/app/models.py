from enum import Enum
from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date

T = TypeVar('T')

class GameMode(str, Enum):
    passthrough = "passthrough"
    walls = "walls"

class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"

class Position(BaseModel):
    x: int
    y: int

class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    createdAt: datetime

class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    date: date

class ActivePlayer(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    snake: List[Position]
    food: Position
    direction: Direction
    startedAt: datetime

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None

class AuthResponse(ApiResponse[User]):
    user: Optional[User] = None

# Request Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    email: EmailStr
    username: str
    password: str

class ScoreSubmission(BaseModel):
    score: int
    mode: GameMode
