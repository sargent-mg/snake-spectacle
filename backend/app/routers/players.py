from fastapi import APIRouter, HTTPException
from typing import List, Optional
from ..models import ActivePlayer, ApiResponse
from ..database import db

router = APIRouter(prefix="/players", tags=["players"])

@router.get("", response_model=ApiResponse[List[ActivePlayer]])
async def get_active_players():
    players = db.get_active_players()
    return ApiResponse(success=True, data=players)

@router.get("/{player_id}", response_model=ApiResponse[ActivePlayer])
async def get_player(player_id: str):
    player = db.get_player(player_id)
    if not player:
        return ApiResponse(success=False, error="Player not found")
    return ApiResponse(success=True, data=player)
