import asyncio
import uuid
from app.database import AsyncSessionLocal, engine, create_user, get_user_by_email, add_score, get_leaderboard
from app.db_models import Base
from app.models import GameMode

async def main():
    print("Initializing database...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("Creating user...")
        email = f"test_{uuid.uuid4()}@example.com"
        username = f"user_{uuid.uuid4()}"
        user = await create_user(session, email, username, "password123")
        print(f"User created: {user}")

        print("Fetching user...")
        fetched_user = await get_user_by_email(session, email)
        print(f"User fetched: {fetched_user}")
        assert fetched_user.email == email

        print("Adding score...")
        entry = await add_score(session, username, 1000, GameMode.walls)
        print(f"Score added: {entry}")

        print("Fetching leaderboard...")
        leaderboard = await get_leaderboard(session, GameMode.walls)
        print(f"Leaderboard: {leaderboard}")
        assert len(leaderboard) > 0
        assert leaderboard[0].username == username

    print("Verification successful!")

if __name__ == "__main__":
    asyncio.run(main())
