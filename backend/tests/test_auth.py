import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, admin_user):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "adminpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "admin"
    assert "refresh_token" in response.cookies

@pytest.mark.asyncio
async def test_login_failure_wrong_password(client: AsyncClient, admin_user):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_login_oauth2_token_success(client: AsyncClient, admin_user):
    response = await client.post(
        "/api/v1/auth/token",
        data={"username": "admin@test.com", "password": "adminpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "admin"
    assert "refresh_token" in response.cookies

@pytest.mark.asyncio
async def test_rbac_member_route_access(client: AsyncClient, normal_user_token_headers, admin_token_headers):
    # Member user should have access to /test-member
    res_member = await client.get("/api/v1/auth/test-member", headers=normal_user_token_headers)
    assert res_member.status_code == 200
    assert res_member.json()["role"] == "member"
    
    # Admin user should also have access to /test-member
    res_admin = await client.get("/api/v1/auth/test-member", headers=admin_token_headers)
    assert res_admin.status_code == 200
    assert res_admin.json()["role"] == "admin"

@pytest.mark.asyncio
async def test_rbac_admin_route_access(client: AsyncClient, normal_user_token_headers, admin_token_headers):
    # Admin user should have access to /test-admin
    res_admin = await client.get("/api/v1/auth/test-admin", headers=admin_token_headers)
    assert res_admin.status_code == 200
    assert res_admin.json()["role"] == "admin"
    
    # Member user should be denied access to /test-admin (403)
    res_member = await client.get("/api/v1/auth/test-admin", headers=normal_user_token_headers)
    assert res_member.status_code == 403
