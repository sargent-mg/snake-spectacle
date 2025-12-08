import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    response = await client.post("/auth/signup", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["username"] == "testuser"

@pytest.mark.asyncio
async def test_signup_duplicate(client: AsyncClient):
    # First signup
    await client.post("/auth/signup", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123"
    })
    
    # Second signup (duplicate)
    response = await client.post("/auth/signup", json={
        "email": "test@example.com",
        "username": "otheruser",
        "password": "password123"
    })
    assert response.status_code == 201 # Note: The current implementation returns 201 but with success=False for duplicates
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "User already exists"

@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    # Setup user
    await client.post("/auth/signup", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123"
    })
    
    # Login success
    response = await client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_login_failure(client: AsyncClient):
    response = await client.post("/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "Invalid credentials"

@pytest.mark.asyncio
async def test_me(client: AsyncClient):
    # Setup user
    await client.post("/auth/signup", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123"
    })
    
    # Get me
    response = await client.get("/auth/me", headers={
        "Authorization": "Bearer test@example.com"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_me_unauthorized(client: AsyncClient):
    response = await client.get("/auth/me", headers={
        "Authorization": "Bearer invalid"
    })
    assert response.status_code == 401
