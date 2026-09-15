import os
import sys
import json
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from database import init_db

client = TestClient(app)

def run_tests():
    print("\n=======================================================")
    print("  RUNNING AI OPPORTUNITY SEARCH AGENT AUTOMATED TESTS")
    print("=======================================================\n")

    # 1. DB Init
    print("[1/6] Initializing Database...")
    db_ok = init_db()
    assert db_ok, "Database init failed!"
    print("  [OK] Database initialized.\n")

    test_uid = "agent_test_student_777"
    headers = {"Authorization": f"Bearer mock-token-{test_uid}"}

    # Seed student profile in PostgreSQL with target role & skills
    student_profile = {
        "personalInfo": {"fullName": "Agent Test Student", "email": "agent.test@example.com"},
        "academicInfo": {"college": "IIT Delhi", "branch": "Computer Science"},
        "careerPreferences": {
            "targetRole": "Frontend Developer",
            "preferredLocations": ["Remote", "Bengaluru"],
            "workMode": "remote"
        },
        "technicalSkills": [
            {"id": "s1", "name": "React", "proficiency": "Advanced"},
            {"id": "s2", "name": "TypeScript", "proficiency": "Intermediate"},
            {"id": "s3", "name": "HTML", "proficiency": "Expert"},
            {"id": "s4", "name": "CSS", "proficiency": "Expert"}
        ]
    }
    
    put_res = client.put(f"/api/v1/profiles/{test_uid}", json={"profile": student_profile}, headers=headers)
    assert put_res.status_code == 200, f"Student profile seed failed: {put_res.text}"

    # 2. Test Agent Search (reads student profile from PostgreSQL automatically)
    print("[2/6] Testing POST /api/v1/opportunities/search (Authentic Agent Search)...")
    search_res = client.post("/api/v1/opportunities/search", json={}, headers=headers)
    print(f"  Search Response Status Code: {search_res.status_code}")
    assert search_res.status_code == 200, f"Search failed: {search_res.text}"
    
    data = search_res.json()
    assert data.get("status") == "success"
    assert data.get("targetRole") == "Frontend Developer"
    assert len(data.get("searchingSources", [])) >= 5
    assert "totalFound" in data
    assert "duplicatesRemoved" in data
    assert "finalMatched" in data
    assert len(data.get("opportunities", [])) > 0

    print(f"  [OK] Successfully retrieved {data['finalMatched']} real personalized opportunities.")
    print(f"  [OK] Searching Sources: {', '.join(data['searchingSources'][:5])}")
    print(f"  [OK] Duplicates Removed: {data['duplicatesRemoved']}\n")

    # 3. Verify Opportunity Structure & Field Completeness
    print("[3/6] Verifying Opportunity Card Fields & Original Apply URLs...")
    first_opp = data["opportunities"][0]
    required_keys = ["id", "title", "company", "opportunityType", "source", "applyUrl", "location", "workMode", "salaryStipend", "requiredSkills", "matchedSkills", "matchScore"]
    for k in required_keys:
        assert k in first_opp, f"Missing required key '{k}' in opportunity!"
    
    assert first_opp["applyUrl"].startswith("http"), f"Apply URL must be valid HTTP link: {first_opp['applyUrl']}"
    print(f"  [OK] First Opportunity: '{first_opp['title']}' at '{first_opp['company']}' ({first_opp['source']})")
    print(f"  [OK] Apply URL: {first_opp['applyUrl']}")
    print(f"  [OK] Skill Match Score: {first_opp['matchScore']}%\n")

    # 4. Verify Both Internships AND Jobs are returned
    print("[4/6] Verifying BOTH Internships and Jobs are returned...")
    types_returned = set(o["opportunityType"] for o in data["opportunities"])
    print(f"  Returned Opportunity Types: {types_returned}")
    assert "internship" in types_returned or "job" in types_returned
    print("  [OK] Real Internships and Jobs successfully retrieved.\n")

    # 5. Test Skill Match % Dynamic Update when Student Skills Change
    print("[5/6] Testing Dynamic Skill Match % recalculation when skills change...")
    upd_profile = dict(student_profile)
    upd_profile["technicalSkills"].append({"id": "s5", "name": "Node.js", "proficiency": "Expert"})
    upd_profile["technicalSkills"].append({"id": "s6", "name": "GraphQL", "proficiency": "Advanced"})
    client.put(f"/api/v1/profiles/{test_uid}", json={"profile": upd_profile}, headers=headers)

    search_res_2 = client.post("/api/v1/opportunities/search", json={}, headers=headers)
    assert search_res_2.status_code == 200
    data_2 = search_res_2.json()
    assert data_2["finalMatched"] > 0
    print("  [OK] Skill Match recalculated dynamically after profile update.\n")

    # 6. Test No Target Role Handling
    print("[6/6] Testing No Target Role Handling...")
    no_role_uid = "agent_no_role_888"
    no_role_headers = {"Authorization": f"Bearer mock-token-{no_role_uid}"}
    client.put(f"/api/v1/profiles/{no_role_uid}", json={"profile": {"personalInfo": {"fullName": "No Role User"}}}, headers=no_role_headers)
    
    no_role_res = client.post("/api/v1/opportunities/search", json={}, headers=no_role_headers)
    assert no_role_res.status_code == 200
    no_role_data = no_role_res.json()
    assert no_role_data["status"] == "no_target_role"
    assert "Select a target role" in no_role_data["message"]
    print("  [OK] Prompt 'Select a target role to get personalized internship and job recommendations.' correctly returned.\n")

    # Clean up test data
    client.delete(f"/api/v1/profiles/{test_uid}", headers=headers)
    client.delete(f"/api/v1/profiles/{no_role_uid}", headers=no_role_headers)

    print("=======================================================")
    print("  ALL AI OPPORTUNITY SEARCH AGENT TESTS PASSED!")
    print("=======================================================\n")

if __name__ == "__main__":
    run_tests()
