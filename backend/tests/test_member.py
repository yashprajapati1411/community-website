import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_my_profile(client: AsyncClient, normal_user_token_headers):
    response = await client.get("/api/v1/members/me", headers=normal_user_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Member Test"
    assert data["village"] == "Test Village"

@pytest.mark.asyncio
async def test_update_my_profile(client: AsyncClient, normal_user_token_headers):
    update_payload = {
        "full_name": "Updated Member Name",
        "address": "New Address 123",
        "mobile": "7777777777"
    }
    response = await client.put(
        "/api/v1/members/me",
        json=update_payload,
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Member Name"
    assert data["address"] == "New Address 123"
    assert data["mobile"] == "7777777777"

@pytest.mark.asyncio
async def test_family_member_crud(client: AsyncClient, normal_user_token_headers):
    # 1. Create a family member
    create_payload = {
        "name": "Child One",
        "relation": "Son",
        "age": 10,
        "education": "Primary"
    }
    res_create = await client.post(
        "/api/v1/members/family",
        json=create_payload,
        headers=normal_user_token_headers
    )
    assert res_create.status_code == 201
    family_id = res_create.json()["id"]
    assert res_create.json()["name"] == "Child One"
    
    # 2. Get family members list
    res_list = await client.get("/api/v1/members/family", headers=normal_user_token_headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1
    
    # 3. Update family member
    res_update = await client.put(
        f"/api/v1/members/family/{family_id}",
        json={"education": "Secondary"},
        headers=normal_user_token_headers
    )
    assert res_update.status_code == 200
    assert res_update.json()["education"] == "Secondary"
    
    # 4. Delete family member
    res_delete = await client.delete(
        f"/api/v1/members/family/{family_id}",
        headers=normal_user_token_headers
    )
    assert res_delete.status_code == 204

@pytest.mark.asyncio
async def test_get_dashboard(client: AsyncClient, normal_user_token_headers):
    response = await client.get("/api/v1/members/dashboard", headers=normal_user_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert "statistics" in data
    assert "family_members_count" in data["statistics"]

