from fastapi import APIRouter, Depends, Query
from typing import List, Optional, Annotated
from ..models import LeaderboardEntry, GameMode, ApiResponse, ScoreSubmission, User
from ..database import db
from .auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

@router.get("", response_model=ApiResponse[List[LeaderboardEntry]])
async def get_leaderboard(mode: Optional[GameMode] = None):
    entries = db.get_leaderboard(mode)
    return ApiResponse(success=True, data=entries)

@router.post("", response_model=ApiResponse[LeaderboardEntry], status_code=201)
async def submit_score(
    submission: ScoreSubmission,
    current_user: Annotated[User, Depends(get_current_user)]
):
    entry = db.add_score(current_user.username, submission.score, submission.mode)
    return ApiResponse(success=True, data=entry)
