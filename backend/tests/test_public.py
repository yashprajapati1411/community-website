import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_public_committee(client: AsyncClient):
    response = await client.get("/api/v1/public/committee")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_public_gallery_albums(client: AsyncClient):
    response = await client.get("/api/v1/public/gallery/albums")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_public_events(client: AsyncClient):
    response = await client.get("/api/v1/public/events")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_public_notices(client: AsyncClient):
    response = await client.get("/api/v1/public/notices")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_public_history(client: AsyncClient):
    response = await client.get("/api/v1/public/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_public_booking_availability(client: AsyncClient):
    response = await client.get("/api/v1/public/bookings/availability?date=2026-10-10&hall=Main%20Hall")
    assert response.status_code == 200
    data = response.json()
    assert "available" in data

