from sqlalchemy import Column, Integer, String, DateTime, Date, Enum as SQLEnum
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime, date
import uuid
from .models import GameMode

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)  # Storing password directly for now as per mock, should be hashed in real app
    created_at = Column(DateTime, default=datetime.now)

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, index=True)
    score = Column(Integer, index=True)
    mode = Column(SQLEnum(GameMode))
    date = Column(Date, default=date.today)
