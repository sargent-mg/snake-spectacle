from typing import List, Optional
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from .config import settings
from .db_models import User as DBUser, LeaderboardEntry as DBLeaderboardEntry
from .models import User, LeaderboardEntry, ActivePlayer, GameMode, Position, Direction
from datetime import datetime, date
import uuid

# Database Setup
engine = create_async_engine(settings.DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# In-memory store for active players (transient data)
active_players_store: dict[str, ActivePlayer] = {}

# CRUD Operations

async def create_user(session: AsyncSession, email: str, username: str, password: str) -> Optional[User]:
    # Check if user exists
    stmt = select(DBUser).where((DBUser.email == email) | (DBUser.username == username))
    result = await session.execute(stmt)
    if result.scalar_one_or_none():
        return None

    new_user = DBUser(
        email=email,
        username=username,
        password_hash=password, # In real app, hash this!
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    
    return User(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        createdAt=new_user.created_at
    )

async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
    stmt = select(DBUser).where(DBUser.email == email)
    result = await session.execute(stmt)
    db_user = result.scalar_one_or_none()
    if db_user:
        return User(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            createdAt=db_user.created_at
        )
    return None

async def verify_password(session: AsyncSession, email: str, password: str) -> bool:
    stmt = select(DBUser).where(DBUser.email == email)
    result = await session.execute(stmt)
    db_user = result.scalar_one_or_none()
    if db_user:
        return db_user.password_hash == password
    return False

async def get_leaderboard(session: AsyncSession, mode: Optional[GameMode] = None) -> List[LeaderboardEntry]:
    stmt = select(DBLeaderboardEntry)
    if mode:
        stmt = stmt.where(DBLeaderboardEntry.mode == mode)
    
    stmt = stmt.order_by(DBLeaderboardEntry.score.desc()).limit(10)
    result = await session.execute(stmt)
    entries = result.scalars().all()
    
    return [
        LeaderboardEntry(
            id=e.id,
            username=e.username,
            score=e.score,
            mode=e.mode,
            date=e.date
        ) for e in entries
    ]

async def add_score(session: AsyncSession, username: str, score: int, mode: GameMode) -> LeaderboardEntry:
    entry = DBLeaderboardEntry(
        username=username,
        score=score,
        mode=mode,
        date=date.today()
    )
    session.add(entry)
    await session.commit()
    await session.refresh(entry)
    
    return LeaderboardEntry(
        id=entry.id,
        username=entry.username,
        score=entry.score,
        mode=entry.mode,
        date=entry.date
    )

# Active Player Operations (In-Memory)

def get_active_players() -> List[ActivePlayer]:
    return list(active_players_store.values())

def get_player(player_id: str) -> Optional[ActivePlayer]:
    return active_players_store.get(player_id)

def update_player(player: ActivePlayer):
    active_players_store[player.id] = player

def remove_player(player_id: str):
    if player_id in active_players_store:
        del active_players_store[player_id]
