import urllib.request
import urllib.error
import json
import os

BASE_URL = "http://127.0.0.1:8000/api/v1"

def req(url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode() if data is not None else None
    request = urllib.request.Request(f"{BASE_URL}{url}", data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(request) as res:
            res_body = res.read()
            return {
                "status": res.status,
                "data": json.loads(res_body) if res_body else None,
                "success": True
            }
    except urllib.error.HTTPError as e:
        res_body = e.read()
        return {
            "status": e.code,
            "data": json.loads(res_body) if res_body else None,
            "success": False
        }

def run_tests():
    results = []
    
    print("--- 1. Testing Authentication ---")
    login_res = req("/auth/login", method="POST", data={"email": "demo@sspv.org", "password": "demo123"})
    assert login_res["success"], f"Login failed: {login_res}"
    token = login_res["data"]["access_token"]
    print("Login successful. Got Token.")
    
    print("--- 2. Testing GET /members/me ---")
    me_res = req("/members/me", token=token)
    results.append({
        "endpoint": "GET /api/v1/members/me",
        "expected": 200,
        "actual": me_res["status"],
        "pass": me_res["status"] == 200,
        "notes": f"Got profile: {me_res['data'].get('full_name')} ({me_res['data'].get('mobile')})" if me_res['data'] else "No data"
    })
    
    print("--- 3. Testing PUT /members/me (Valid Update) ---")
    orig_address = me_res["data"]["address"]
    put_me_res = req("/members/me", method="PUT", token=token, data={
        "full_name": "Rajesh Parmar",
        "village": "Junagadh",
        "address": "42, Heritage Enclave, Vastrapur, Ahmedabad",
        "mobile": "9876543210"
    })
    results.append({
        "endpoint": "PUT /api/v1/members/me",
        "expected": 200,
        "actual": put_me_res["status"],
        "pass": put_me_res["status"] == 200,
        "notes": f"Updated address to: {put_me_res['data'].get('address')}" if put_me_res['data'] else "Failed"
    })
    
    print("--- 4. Testing PUT /members/me (Invalid Mobile Regex) ---")
    bad_me_res = req("/members/me", method="PUT", token=token, data={
        "mobile": "123" # invalid regex
    })
    results.append({
        "endpoint": "PUT /api/v1/members/me (Validation)",
        "expected": 422,
        "actual": bad_me_res["status"],
        "pass": bad_me_res["status"] == 422,
        "notes": "Properly rejected 3-digit mobile number with 422 Unprocessable Entity"
    })
    
    print("--- 5. Testing GET /members/dashboard ---")
    dash_res = req("/members/dashboard", token=token)
    results.append({
        "endpoint": "GET /api/v1/members/dashboard",
        "expected": 200,
        "actual": dash_res["status"],
        "pass": dash_res["status"] == 200,
        "notes": f"Stats returned: {dash_res['data'].get('statistics')}" if dash_res['data'] else "Failed"
    })
    
    print("--- 6. Testing GET /members/family ---")
    fam_res = req("/members/family", token=token)
    results.append({
        "endpoint": "GET /api/v1/members/family",
        "expected": 200,
        "actual": fam_res["status"],
        "pass": fam_res["status"] == 200,
        "notes": f"Fetched {len(fam_res['data'])} existing family members" if fam_res['data'] is not None else "Failed"
    })
    
    print("--- 7. Testing POST /members/family (Create Relative) ---")
    post_fam_res = req("/members/family", method="POST", token=token, data={
        "name": "Sneha Parmar",
        "relation": "Spouse",
        "age": 44,
        "education": "B.A. Economics",
        "occupation": "Homemaker"
    })
    results.append({
        "endpoint": "POST /api/v1/members/family",
        "expected": 201,
        "actual": post_fam_res["status"],
        "pass": post_fam_res["status"] == 201,
        "notes": f"Created family member ID {post_fam_res['data'].get('id')} ({post_fam_res['data'].get('name')})" if post_fam_res['data'] else "Failed"
    })
    created_id = post_fam_res["data"].get("id") if post_fam_res["data"] else None
    
    print("--- 8. Testing PUT /members/family/{id} (Update Relative) ---")
    if created_id:
        put_fam_res = req(f"/members/family/{created_id}", method="PUT", token=token, data={
            "age": 45,
            "occupation": "Interior Designer"
        })
        results.append({
            "endpoint": f"PUT /api/v1/members/family/{{id}}",
            "expected": 200,
            "actual": put_fam_res["status"],
            "pass": put_fam_res["status"] == 200,
            "notes": f"Updated member age to 45, occupation to {put_fam_res['data'].get('occupation')}" if put_fam_res['data'] else "Failed"
        })
    else:
        results.append({
            "endpoint": "PUT /api/v1/members/family/{id}",
            "expected": 200,
            "actual": 0,
            "pass": False,
            "notes": "Skipped because create failed"
        })

    print("--- 9. Testing DELETE /members/family/{id} (Delete Relative) ---")
    if created_id:
        del_fam_res = req(f"/members/family/{created_id}", method="DELETE", token=token)
        results.append({
            "endpoint": f"DELETE /api/v1/members/family/{{id}}",
            "expected": 204,
            "actual": del_fam_res["status"],
            "pass": del_fam_res["status"] == 204,
            "notes": "Successfully deleted family relative (HTTP 204 No Content)"
        })
    else:
        results.append({
            "endpoint": "DELETE /api/v1/members/family/{id}",
            "expected": 204,
            "actual": 0,
            "pass": False,
            "notes": "Skipped because create failed"
        })

    print("--- 10. Testing RBAC / Unauthenticated Access ---")
    unauth_res = req("/members/me", token=None)
    results.append({
        "endpoint": "GET /api/v1/members/me (No Token)",
        "expected": 401,
        "actual": unauth_res["status"],
        "pass": unauth_res["status"] == 401,
        "notes": "Properly rejected unauthenticated request with HTTP 401 Unauthorized"
    })

    with open("scratch/m2_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print("\nAll tests completed. Saved to scratch/m2_test_results.json")

if __name__ == "__main__":
    run_tests()
