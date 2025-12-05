import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import db

client = TestClient(app)

# Reset DB before tests if needed, but for now we rely on fresh start or unique data
# Since tests run in same process with TestClient, the global 'db' instance persists.
# We should probably reset it or use unique emails.

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Snake Spectacle API is running"}

def test_signup_login_flow():
    email = "test@example.com"
    username = "TestUser"
    password = "password123"

    # Signup
    response = client.post("/auth/signup", json={
        "email": email,
        "username": username,
        "password": password
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == email
    assert data["user"]["username"] == username

    # Login
    response = client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == email

    # Login invalid
    response = client.post("/auth/login", json={
        "email": email,
        "password": "wrongpassword"
    })
    assert response.status_code == 200
    assert response.json()["success"] is False

def test_get_me():
    # Use demo user
    token = "demo@snake.game"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == token

def test_leaderboard():
    response = client.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) > 0

    # Submit score
    token = "demo@snake.game"
    headers = {"Authorization": f"Bearer {token}"}
    score_data = {"score": 9999, "mode": "walls"}
    
    response = client.post("/leaderboard", json=score_data, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["score"] == 9999
    assert data["data"]["username"] == "DemoPlayer"

    # Verify in leaderboard
    response = client.get("/leaderboard?mode=walls")
    data = response.json()
    top_score = data["data"][0]
    assert top_score["score"] == 9999

def test_active_players():
    response = client.get("/players")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    players = data["data"]
    assert len(players) > 0
    
    player_id = players[0]["id"]
    response = client.get(f"/players/{player_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["id"] == player_id
