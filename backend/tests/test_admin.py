import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_admin_dashboard_summary(client: AsyncClient, admin_token_headers):
    response = await client.get("/api/v1/admin/dashboard/summary", headers=admin_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_members_count" in data
    assert "upcoming_events_count" in data


@pytest.mark.asyncio
async def test_admin_dashboard_summary_unauthorized(client: AsyncClient, normal_user_token_headers):
    response = await client.get("/api/v1/admin/dashboard/summary", headers=normal_user_token_headers)
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_admin_notices_crud(client: AsyncClient, admin_token_headers):
    # 1. Create a notice
    payload = {
        "title": "Important Annual General Meeting",
        "description": "All members are requested to attend the upcoming AGM at the community hall.",
        "priority": "high",
        "publish_date": "2026-07-01",
        "show_on_homepage": True,
        "is_pinned": True,
        "is_active": True
    }
    res_create = await client.post("/api/v1/admin/notices", json=payload, headers=admin_token_headers)
    assert res_create.status_code == 201
    notice_id = res_create.json()["id"]
    assert res_create.json()["title"] == payload["title"]
    
    # 2. List all notices
    res_list = await client.get("/api/v1/admin/notices", headers=admin_token_headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1
    
    # 3. Update notice
    res_update = await client.put(
        f"/api/v1/admin/notices/{notice_id}",
        json={"priority": "medium"},
        headers=admin_token_headers
    )
    assert res_update.status_code == 200
    assert res_update.json()["priority"] == "medium"
    
    # 4. Delete notice
    res_delete = await client.delete(f"/api/v1/admin/notices/{notice_id}", headers=admin_token_headers)
    assert res_delete.status_code == 204

@pytest.mark.asyncio
async def test_admin_notices_rbac_restricted(client: AsyncClient, normal_user_token_headers):
    payload = {
        "title": "Hack Notice",
        "description": "Should be rejected.",
        "priority": "low",
        "publish_date": "2026-07-01"
    }
    response = await client.post("/api/v1/admin/notices", json=payload, headers=normal_user_token_headers)
    assert response.status_code == 403

import os

@pytest.mark.asyncio
async def test_admin_upload_images_all_formats(client: AsyncClient, admin_token_headers):
    formats = [
        ("test.jpg", "image/jpeg", b"\xff\xd8\xff\xe0testjpegdata"),
        ("test.png", "image/png", b"\x89PNG\r\n\x1a\ntestpngdata"),
        ("test.gif", "image/gif", b"GIF89atestgifdata"),
        ("test.webp", "image/webp", b"RIFFtestwebpdata"),
    ]
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    for filename, mime_type, content in formats:
        files = {"file": (filename, content, mime_type)}
        res_upload = await client.post(
            "/api/v1/admin/upload?category=gallery",
            files=files,
            headers=admin_token_headers
        )
        assert res_upload.status_code == 201, f"Failed to upload {mime_type}: {res_upload.text}"
        data = res_upload.json()
        assert "url" in data
        file_url = data["url"]
        assert file_url.startswith("/uploads/gallery/")
        
        # Verify file physically exists on disk
        rel_path = file_url.lstrip("/")
        abs_file_path = os.path.join(base_dir, rel_path)
        assert os.path.exists(abs_file_path), f"File {abs_file_path} not found on disk!"
        with open(abs_file_path, "rb") as f:
            saved_content = f.read()
        assert saved_content == content
        
        # Verify StaticFiles serves the uploaded image correctly
        res_static = await client.get(file_url)
        assert res_static.status_code == 200
        assert res_static.content == content
        
        # Verify deletion via DELETE /api/v1/admin/upload
        res_delete = await client.delete(
            f"/api/v1/admin/upload?file_url={file_url}",
            headers=admin_token_headers
        )
        assert res_delete.status_code == 204
        assert not os.path.exists(abs_file_path), f"File {abs_file_path} should have been deleted!"
