import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_active_players(client: AsyncClient):
    # Active players are currently mock/in-memory, so we just test the endpoint returns success
    response = await client.get("/players")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
