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

@pytest.mark.asyncio
async def test_admin_reports_crud(client: AsyncClient, admin_token_headers):
    # 1. Create a report
    payload = {
        "title": "Annual Report FY 2025-26",
        "description": "Financial and operational report for the year.",
        "financial_year": "2025-2026",
        "file_url": "/uploads/reports/report_2025_26.pdf",
        "display_order": 1,
        "is_published": True
    }
    res_create = await client.post("/api/v1/admin/reports", json=payload, headers=admin_token_headers)
    assert res_create.status_code == 201
    report_id = res_create.json()["id"]
    assert res_create.json()["title"] == payload["title"]
    
    # 2. List reports admin
    res_list = await client.get("/api/v1/admin/reports", headers=admin_token_headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1
    
    # 3. Public reports list
    res_pub = await client.get("/api/v1/public/reports")
    assert res_pub.status_code == 200
    assert any(r["id"] == report_id for r in res_pub.json())
    
    # 4. Update report
    res_update = await client.put(
        f"/api/v1/admin/reports/{report_id}",
        json={"title": "Updated Annual Report FY 2025-26"},
        headers=admin_token_headers
    )
    assert res_update.status_code == 200
    assert res_update.json()["title"] == "Updated Annual Report FY 2025-26"
    
    # 5. Delete report
    res_delete = await client.delete(f"/api/v1/admin/reports/{report_id}", headers=admin_token_headers)
    assert res_delete.status_code == 204

@pytest.mark.asyncio
async def test_event_registration_and_admin_view(client: AsyncClient, admin_token_headers):
    # 1. Create an event with form_fields
    event_payload = {
        "title": "Community Gathering 2026",
        "description": "Annual get-together with dinner and cultural events.",
        "event_date": "2026-11-20",
        "location": "Main Community Hall",
        "status": "published",
        "form_fields": ["name", "mobile", "email", "member_count", "remarks"]
    }
    res_ev = await client.post("/api/v1/admin/events", json=event_payload, headers=admin_token_headers)
    assert res_ev.status_code == 201
    event_id = res_ev.json()["id"]
    
    # 2. Register for the event (public)
    reg_payload = {
        "name": "Amit Prajapati",
        "mobile": "9876543210",
        "email": "amit@example.com",
        "member_count": 3,
        "remarks": "Vegetarian food preference"
    }
    res_reg = await client.post(f"/api/v1/public/events/{event_id}/register", json=reg_payload)
    assert res_reg.status_code == 201
    assert res_reg.json()["event_id"] == event_id
    assert res_reg.json()["member_count"] == 3
    
    # 3. View registrations in Admin Dashboard
    res_admin_regs = await client.get(f"/api/v1/admin/events/{event_id}/registrations", headers=admin_token_headers)
    assert res_admin_regs.status_code == 200
    summary = res_admin_regs.json()
    assert summary["total_registrations"] == 1
    assert summary["total_expected_attendees"] == 3
    assert len(summary["registrations"]) == 1
    assert summary["registrations"][0]["name"] == "Amit Prajapati"

@pytest.mark.asyncio
async def test_registration_approval_workflow(client: AsyncClient, admin_token_headers):
    # 1. Submit registration request
    reg_payload = {
        "full_name": "Suresh Bhai Patel",
        "mobile": "9988776655",
        "email": "suresh@example.com",
        "village": "Surat",
        "password": "SecurePassword123!"
    }
    res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
    assert res_reg.status_code == 201
    req_id = res_reg.json()["id"]
    assert res_reg.json()["status"] == "pending"
    
    # 2. Try to login while pending (inactive user) - should fail
    res_login = await client.post("/api/v1/auth/login", json={"mobile": "9988776655", "password": "SecurePassword123!"})
    assert res_login.status_code in [400, 401, 403]
    
    # 3. Admin lists pending registrations
    res_list = await client.get("/api/v1/admin/registrations?status=pending", headers=admin_token_headers)
    assert res_list.status_code == 200
    assert any(r["id"] == req_id for r in res_list.json())
    
    # 4. Admin approves registration
    res_approve = await client.post(f"/api/v1/admin/registrations/{req_id}/approve", headers=admin_token_headers)
    assert res_approve.status_code == 200
    assert res_approve.json()["status"] == "approved"
    
    # 5. User can now login!
    res_login_after = await client.post("/api/v1/auth/login", json={"mobile": "9988776655", "password": "SecurePassword123!"})
    assert res_login_after.status_code == 200
    assert "access_token" in res_login_after.json()

@pytest.mark.asyncio
async def test_registration_rejection_workflow(client: AsyncClient, admin_token_headers):
    # 1. Submit registration request to be rejected
    reg_payload = {
        "full_name": "Rejected Bhai Patel",
        "mobile": "9911223344",
        "email": "rejected@example.com",
        "village": "Ahmedabad",
        "password": "SecurePassword123!"
    }
    res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
    assert res_reg.status_code == 201
    req_id = res_reg.json()["id"]
    assert res_reg.json()["status"] == "pending"

    # 2. Admin rejects registration
    res_reject = await client.post(f"/api/v1/admin/registrations/{req_id}/reject", headers=admin_token_headers)
    assert res_reject.status_code == 200
    assert res_reject.json()["status"] == "rejected"

    # 3. User login is blocked!
    res_login_blocked = await client.post("/api/v1/auth/login", json={"mobile": "9911223344", "password": "SecurePassword123!"})
    assert res_login_blocked.status_code in [400, 401, 403]


