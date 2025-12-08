from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .routers import auth, leaderboard, players
from .database import engine
from .db_models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="Snake Spectacle API",
    description="Backend API for the Snake Spectacle game",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(auth.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(players.router, prefix="/api")

# Serve Frontend
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

@app.get("/api")
async def root():
    return {"message": "Snake Spectacle API is running"}

# Mount assets directory (Vite puts assets and other static files here)
# We check if /app/static exists (which it will in the container)
if os.path.exists("/app/static"):
    app.mount("/assets", StaticFiles(directory="/app/static/assets"), name="assets")
    
    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        # Check if file exists in static folder (e.g. favicon.ico)
        if "." in catchall and os.path.exists(f"/app/static/{catchall}"):
            return FileResponse(f"/app/static/{catchall}")
        # Otherwise return index.html for SPA routing
        return FileResponse("/app/static/index.html")
