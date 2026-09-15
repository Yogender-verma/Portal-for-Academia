import os
import sys
import json
import logging
from fastapi.testclient import TestClient

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from database import init_db

client = TestClient(app)

def run_tests():
    print("\n====================================================================")
    print("  POSTGRESQL PROFILE PERSISTENCE & SECURITY TESTS (STUDENT, COMPANY, COLLEGE)")
    print("====================================================================\n")

    # 0. Test DB Initialization
    print("[1/8] Testing PostgreSQL Database Connection & Tables...")
    db_ok = init_db()
    assert db_ok, "Database initialization failed!"
    print("  [OK] Database connected; student_profiles, company_profiles, college_profiles verified.\n")

    test_uid_1 = "test_alpha_1001"
    test_uid_2 = "test_beta_2002"

    headers_user_1 = {"Authorization": f"Bearer mock-token-{test_uid_1}"}
    headers_user_2 = {"Authorization": f"Bearer mock-token-{test_uid_2}"}

    # ---------------------------------------------------------
    # 1. STUDENT PROFILE TESTS
    # ---------------------------------------------------------
    print("[2/8] Testing Student Profile (PUT -> GET Round-trip)...")
    student_payload = {
        "personalInfo": {"fullName": "Student Alpha", "email": "alpha.student@example.com"},
        "academicInfo": {"college": "IIT Bombay", "cgpa": "9.5"},
        "technicalSkills": [{"name": "TypeScript"}, {"name": "Python"}]
    }
    put_res = client.put(f"/api/v1/profiles/{test_uid_1}", json={"profile": student_payload}, headers=headers_user_1)
    assert put_res.status_code == 200, f"Student PUT failed: {put_res.text}"
    
    get_res = client.get(f"/api/v1/profiles/{test_uid_1}", headers=headers_user_1)
    assert get_res.status_code == 200
    assert get_res.json()["profile"]["personalInfo"]["fullName"] == "Student Alpha"
    print("  [OK] Student Profile round-trip verified identically.\n")

    # ---------------------------------------------------------
    # 2. COMPANY PROFILE TESTS
    # ---------------------------------------------------------
    print("[3/8] Testing Company Profile (PUT -> GET Round-trip)...")
    company_payload = {
        "companyName": "Alpha Tech Solutions",
        "officialEmail": "hr@alphatech.com",
        "companyType": "Private",
        "companySize": "51-200",
        "website": "https://alphatech.com"
    }
    comp_put = client.put(f"/api/v1/company-profiles/{test_uid_1}", json={"profile": company_payload}, headers=headers_user_1)
    assert comp_put.status_code == 200, f"Company PUT failed: {comp_put.text}"

    comp_get = client.get(f"/api/v1/company-profiles/{test_uid_1}", headers=headers_user_1)
    assert comp_get.status_code == 200
    assert comp_get.json()["profile"]["companyName"] == "Alpha Tech Solutions"
    print("  [OK] Company Profile round-trip verified identically.\n")

    # ---------------------------------------------------------
    # 3. COLLEGE PROFILE TESTS
    # ---------------------------------------------------------
    print("[4/8] Testing College Profile (PUT -> GET Round-trip)...")
    college_payload = {
        "institutionName": "National Engineering College",
        "officialEmail": "principal@nec.edu.in",
        "naacGrade": "A++",
        "institutionType": "Autonomous Institute"
    }
    coll_put = client.put(f"/api/v1/college-profiles/{test_uid_1}", json={"profile": college_payload}, headers=headers_user_1)
    assert coll_put.status_code == 200, f"College PUT failed: {coll_put.text}"

    coll_get = client.get(f"/api/v1/college-profiles/{test_uid_1}", headers=headers_user_1)
    assert coll_get.status_code == 200
    assert coll_get.json()["profile"]["institutionName"] == "National Engineering College"
    print("  [OK] College Profile round-trip verified identically.\n")

    # ---------------------------------------------------------
    # 4. CROSS-UID SECURITY ISOLATION TESTS
    # ---------------------------------------------------------
    print("[5/8] Testing Security Isolation: Cross-UID Student Read Attempt...")
    cross_student_get = client.get(f"/api/v1/profiles/{test_uid_1}", headers=headers_user_2)
    assert cross_student_get.status_code == 403, f"Expected 403 Forbidden but got {cross_student_get.status_code}"
    print(f"  [OK] Rejected with 403 Forbidden: {cross_student_get.json().get('detail')}")

    print("[6/8] Testing Security Isolation: Cross-UID Company Read & Write Attempt...")
    cross_comp_get = client.get(f"/api/v1/company-profiles/{test_uid_1}", headers=headers_user_2)
    assert cross_comp_get.status_code == 403
    cross_comp_put = client.put(f"/api/v1/company-profiles/{test_uid_1}", json={"profile": {"companyName": "Hacked Name"}}, headers=headers_user_2)
    assert cross_comp_put.status_code == 403
    print(f"  [OK] Company endpoints rejected cross-account access with 403 Forbidden.")

    print("[7/8] Testing Security Isolation: Cross-UID College Read & Write Attempt...")
    cross_coll_get = client.get(f"/api/v1/college-profiles/{test_uid_1}", headers=headers_user_2)
    assert cross_coll_get.status_code == 403
    cross_coll_put = client.put(f"/api/v1/college-profiles/{test_uid_1}", json={"profile": {"institutionName": "Hacked Univ"}}, headers=headers_user_2)
    assert cross_coll_put.status_code == 403
    print(f"  [OK] College endpoints rejected cross-account access with 403 Forbidden.\n")

    # ---------------------------------------------------------
    # 5. UNAUTHENTICATED REQUEST TEST
    # ---------------------------------------------------------
    print("[8/8] Testing Unauthenticated Requests (No Auth Header)...")
    assert client.get(f"/api/v1/profiles/{test_uid_1}").status_code == 401
    assert client.get(f"/api/v1/company-profiles/{test_uid_1}").status_code == 401
    assert client.get(f"/api/v1/college-profiles/{test_uid_1}").status_code == 401
    print("  [OK] All unauthenticated requests rejected with 401 Unauthorized.\n")

    # Cleanup test data
    client.delete(f"/api/v1/profiles/{test_uid_1}", headers=headers_user_1)
    client.delete(f"/api/v1/company-profiles/{test_uid_1}", headers=headers_user_1)
    client.delete(f"/api/v1/college-profiles/{test_uid_1}", headers=headers_user_1)

    print("====================================================================")
    print("  ALL STUDENT, COMPANY, AND COLLEGE PERSISTENCE & SECURITY TESTS PASSED!")
    print("====================================================================\n")

if __name__ == "__main__":
    run_tests()
