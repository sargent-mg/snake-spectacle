import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_submit_score(client: AsyncClient):
    # Setup user
    await client.post("/auth/signup", json={
        "email": "player@example.com",
        "username": "player1",
        "password": "password123"
    })
    
    # Submit score
    response = await client.post("/leaderboard", json={
        "score": 1000,
        "mode": "walls"
    }, headers={
        "Authorization": "Bearer player@example.com"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["score"] == 1000
    assert data["data"]["username"] == "player1"

@pytest.mark.asyncio
async def test_get_leaderboard(client: AsyncClient):
    # Setup user
    await client.post("/auth/signup", json={
        "email": "player@example.com",
        "username": "player1",
        "password": "password123"
    })
    
    # Submit scores
    await client.post("/leaderboard", json={"score": 500, "mode": "walls"}, headers={"Authorization": "Bearer player@example.com"})
    await client.post("/leaderboard", json={"score": 1000, "mode": "walls"}, headers={"Authorization": "Bearer player@example.com"})
    await client.post("/leaderboard", json={"score": 200, "mode": "passthrough"}, headers={"Authorization": "Bearer player@example.com"})
    
    # Get leaderboard (walls)
    response = await client.get("/leaderboard?mode=walls")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    entries = data["data"]
    assert len(entries) == 2
    assert entries[0]["score"] == 1000
    assert entries[1]["score"] == 500

    # Get leaderboard (passthrough)
    response = await client.get("/leaderboard?mode=passthrough")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["score"] == 200
