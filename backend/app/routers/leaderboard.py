from fastapi import APIRouter, Depends, Query
from typing import List, Optional, Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import LeaderboardEntry, GameMode, ApiResponse, ScoreSubmission, User
from ..database import get_db, get_leaderboard as db_get_leaderboard, add_score
from .auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

@router.get("", response_model=ApiResponse[List[LeaderboardEntry]])
async def get_leaderboard(
    mode: Optional[GameMode] = None,
    session: AsyncSession = Depends(get_db)
):
    entries = await db_get_leaderboard(session, mode)
    return ApiResponse(success=True, data=entries)

@router.post("", response_model=ApiResponse[LeaderboardEntry], status_code=201)
async def submit_score(
    submission: ScoreSubmission,
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSession = Depends(get_db)
):
    entry = await add_score(session, current_user.username, submission.score, submission.mode)
    return ApiResponse(success=True, data=entry)
