from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, players

app = FastAPI(
    title="Snake Spectacle API",
    description="Backend API for the Snake Spectacle game",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(players.router)

@app.get("/")
async def root():
    return {"message": "Snake Spectacle API is running"}
