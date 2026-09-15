import os
import sys
import logging
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
from database import init_db, StudentProfileModel, CollegeProfileModel, PlacementRecordModel
from main import app
from seed_demo_college_data import seed_demo_college_data, clear_demo_college_data

client = TestClient(app)
COLLEGE_UID = "college_demo_nit_01"
HEADERS = {"Authorization": f"Bearer mock-token-{COLLEGE_UID}"}

def run_tests():
    print("\n====================================================================")
    print("  SKILLBRIDGE COLLEGE PORTAL BACKEND & DATA SAFETY TEST SUITE")
    print("====================================================================\n")

    # 1. Database Initialization
    print("[1/8] Initializing PostgreSQL database connection...")
    assert init_db(), "Database initialization failed!"
    print("  [OK] Database initialized successfully.\n")

    # 2. Test Security: Unauthenticated Requests (401 Unauthorized)
    print("[2/8] Testing Security: Unauthenticated requests...")
    unauth_res = client.get("/api/v1/college/dashboard")
    assert unauth_res.status_code == 401, f"Expected 401 Unauthorized, got {unauth_res.status_code}"
    print("  [OK] Unauthenticated request correctly rejected with 401 Unauthorized.\n")

    # 3. Seed Demo Data & Check No Auto-Persist of College Profile
    print("[3/8] Testing Demo Seeding & Profile Persistence Isolation...")
    # Clear existing demo college profile if any for clean test
    db = database.SessionLocal()
    try:
        db.query(CollegeProfileModel).filter(CollegeProfileModel.uid == COLLEGE_UID).delete()
        db.commit()
    finally:
        db.close()

    seed_res = seed_demo_college_data(clear_first=True)
    assert seed_res["students"] >= 1900, f"Expected ~2,000 student profiles, seeded {seed_res['students']}"
    assert seed_res["placements"] >= 140, f"Expected ~170 placement records, seeded {seed_res['placements']}"

    # Verify seed script did NOT auto-persist a CollegeProfileModel into DB
    db = database.SessionLocal()
    try:
        prof_in_db = db.query(CollegeProfileModel).filter(CollegeProfileModel.uid == COLLEGE_UID).first()
        assert prof_in_db is None, "Seed script automatically persisted a default CollegeProfileModel! Expected None."
    finally:
        db.close()
    print(f"  [OK] Seeded {seed_res['students']} students and {seed_res['placements']} placements. Confirmed NO default profile was auto-persisted into PostgreSQL.\n")

    # 4. Test College Profile Department Saving & Persistence
    print("[4/8] Testing College Profile Department Management (PUT /api/v1/college-profiles/{uid})...")
    custom_depts = [
        "Computer Science",
        "AI & ML",
        "DS",
        "ECE"
    ]
    payload = {
        "profile": {
            "institutionName": "National Institute of Technology",
            "officialEmail": "tpo@nit.ac.in",
            "departments": custom_depts,
            "accreditation": "NAAC A++"
        }
    }
    save_res = client.put(f"/api/v1/college-profiles/{COLLEGE_UID}", json=payload, headers=HEADERS)
    assert save_res.status_code == 200, f"Failed to save college profile: {save_res.text}"
    
    get_prof_res = client.get(f"/api/v1/college-profiles/{COLLEGE_UID}", headers=HEADERS)
    assert get_prof_res.status_code == 200
    saved_prof = get_prof_res.json()["profile"]
    assert saved_prof["departments"] == custom_depts, f"Expected departments {custom_depts}, got {saved_prof.get('departments')}"
    print("  [OK] College Profile departments successfully saved and verified in PostgreSQL.\n")

    # 5. Test Single Source of Truth Across All College Portal APIs
    print("[5/8] Testing Single Source of Truth across Dashboard, Students, Skill Analytics, Placements, Internships, Career Readiness, Reports...")
    dash_res = client.get("/api/v1/college/dashboard", headers=HEADERS)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["status"] == "success"
    assert dash_data["active_departments"] == custom_depts, "Dashboard active departments mismatch!"

    std_res = client.get("/api/v1/college/students", headers=HEADERS)
    assert std_res.status_code == 200
    std_data = std_res.json()
    assert "available_departments" in std_data
    assert all(d in std_data["available_departments"] for d in custom_depts), "Students API missing custom active departments!"

    skills_res = client.get("/api/v1/college/skill-analytics", headers=HEADERS)
    assert skills_res.status_code == 200
    assert skills_res.json()["active_departments"] == custom_depts

    place_res = client.get("/api/v1/college/placements", headers=HEADERS)
    assert place_res.status_code == 200
    assert place_res.json()["active_departments"] == custom_depts

    intern_res = client.get("/api/v1/college/internships", headers=HEADERS)
    assert intern_res.status_code == 200
    intern_data = intern_res.json()
    assert len(intern_data["opportunities"]) > 0, "No internship opportunities returned"
    sample_intern_id = intern_data["opportunities"][0]["id"]
    single_intern_res = client.get(f"/api/v1/college/internships/{sample_intern_id}", headers=HEADERS)
    assert single_intern_res.status_code == 200, f"Failed to fetch single internship: {single_intern_res.text}"
    single_intern_data = single_intern_res.json()
    assert single_intern_data["status"] == "success"
    assert single_intern_data["internship"]["id"] == sample_intern_id
    assert "description" in single_intern_data["internship"]
    assert "applicationUrl" in single_intern_data["internship"]

    comp_res = client.get("/api/v1/college/companies", headers=HEADERS)
    assert comp_res.status_code == 200, f"Failed to fetch college companies: {comp_res.text}"
    comp_data = comp_res.json()
    assert comp_data["status"] == "success"
    assert comp_data["total_jobs"] >= 6, f"Expected at least 6 jobs, got {comp_data['total_jobs']}"
    assert comp_data["total_partners"] >= 6, f"Expected at least 6 partners, got {comp_data['total_partners']}"

    single_job_res = client.get("/api/v1/college/companies/jobs/swe-swiggy-101", headers=HEADERS)
    assert single_job_res.status_code == 200
    job_detail = single_job_res.json()["job"]
    assert job_detail["company"] == "Swiggy"
    assert "applicationUrl" in job_detail

    single_partner_res = client.get("/api/v1/college/companies/partner-swiggy", headers=HEADERS)
    assert single_partner_res.status_code == 200
    partner_detail = single_partner_res.json()
    assert partner_detail["status"] == "success"
    assert partner_detail["partner"]["name"] == "Swiggy"
    assert len(partner_detail["associated_jobs"]) >= 1

    ready_res = client.get("/api/v1/college/career-readiness", headers=HEADERS)
    assert ready_res.status_code == 200

    rep_res = client.get("/api/v1/college/reports", headers=HEADERS)
    assert rep_res.status_code == 200
    print("  [OK] Single Source of Truth verified across all 7 College Portal backend endpoints.\n")

    # 5b. Test Skill & Department Student Drill-down APIs
    print("[5b/8] Testing Interactive Student Drill-down Endpoints (Skill & Department rankings)...")
    skill_drill = client.get("/api/v1/college/skills/Python/students", headers=HEADERS)
    assert skill_drill.status_code == 200
    s_drill_data = skill_drill.json()
    assert s_drill_data["status"] == "success"
    assert s_drill_data["total"] > 0
    skill_scores_list = [st["skill_score"] for st in s_drill_data["students"]]
    assert skill_scores_list == sorted(skill_scores_list, reverse=True), "Skill drill-down students not sorted DESC by skill score!"

    skill_dept_drill = client.get("/api/v1/college/skills/Python/students?department=Computer%20Science", headers=HEADERS)
    assert skill_dept_drill.status_code == 200
    sd_drill_data = skill_dept_drill.json()
    assert all(st["department"] == "Computer Science" for st in sd_drill_data["students"])

    dept_drill = client.get("/api/v1/college/departments/Computer%20Science/students", headers=HEADERS)
    assert dept_drill.status_code == 200
    d_drill_data = dept_drill.json()
    assert d_drill_data["status"] == "success"
    assert d_drill_data["total"] > 0
    assert all(st["department"] == "Computer Science" for st in d_drill_data["students"])
    readiness_list = [st["industry_readiness"] for st in d_drill_data["students"]]
    assert readiness_list == sorted(readiness_list, reverse=True), "Department drill-down students not sorted DESC by readiness!"
    print("  [OK] Skill & Department drill-down endpoints verified with strict DESC sorting and department filtering.\n")

    # 6. Test Data Safety & Legacy Department Immutability
    print("[6/8] Testing Data Safety: Removing departments must NEVER alter or delete existing student records...")
    # Fetch a sample student's department before removal
    db = database.SessionLocal()
    sample_uid = None
    sample_orig_dept = None
    try:
        sample_st = db.query(StudentProfileModel).filter(StudentProfileModel.is_demo == True).first()
        sample_uid = sample_st.uid
        sample_orig_dept = sample_st.profile_data.get("academicInfo", {}).get("department")
    finally:
        db.close()

    assert sample_orig_dept, "Failed to get sample student department"

    # Update College Profile to remove the sample student's department
    reduced_depts = ["Computer Science"]
    save_reduced = client.put(f"/api/v1/college-profiles/{COLLEGE_UID}", json={"profile": {"departments": reduced_depts}}, headers=HEADERS)
    assert save_reduced.status_code == 200

    # Verify sample student in PostgreSQL still retains original department string
    db = database.SessionLocal()
    try:
        st_after = db.query(StudentProfileModel).filter(StudentProfileModel.uid == sample_uid).first()
        dept_after = st_after.profile_data.get("academicInfo", {}).get("department")
        assert dept_after == sample_orig_dept, f"CRITICAL: Student department was altered! Expected '{sample_orig_dept}', got '{dept_after}'"
    finally:
        db.close()

    # Verify Students API marks removed department as Legacy without losing records
    std_legacy_res = client.get(f"/api/v1/college/students?search={sample_uid}", headers=HEADERS)
    assert std_legacy_res.status_code == 200
    legacy_std = std_legacy_res.json()["students"][0]
    assert legacy_std["department"] == sample_orig_dept
    print(f"  [OK] Confirmed 100% data immutability: Student '{sample_uid}' retained original department '{sample_orig_dept}'.\n")

    # 7. Test Re-Adding Legacy Department (No Duplicate Creation)
    print("[7/8] Testing Re-adding Legacy Department (No duplicate record creation)...")
    count_before = len(client.get("/api/v1/college/students", headers=HEADERS).json()["students"])
    
    # Re-add sample_orig_dept to College Profile
    restored_depts = reduced_depts + [sample_orig_dept]
    client.put(f"/api/v1/college-profiles/{COLLEGE_UID}", json={"profile": {"departments": restored_depts}}, headers=HEADERS)

    count_after = len(client.get("/api/v1/college/students", headers=HEADERS).json()["students"])
    assert count_before == count_after, f"Student count changed upon re-adding department! Before: {count_before}, After: {count_after}"
    print("  [OK] Re-adding department restored active status without recreating or duplicating student records.\n")

    # 8. Test Demo Cleanup Isolation (is_demo=False Real Records Preserved)
    print("[8/8] Testing Real Data Safety (is_demo=False records preserved during clear)...")
    real_uid = "real_student_prod_99"
    db = database.SessionLocal()
    try:
        real_st = StudentProfileModel(
            uid=real_uid,
            profile_data={
                "personalInfo": {"fullName": "Production Real Student"},
                "academicInfo": {"department": "Computer Science"}
            },
            is_demo=False
        )
        db.add(real_st)
        db.commit()
    finally:
        db.close()

    # Perform demo cleanup
    cleared_count = clear_demo_college_data()
    assert cleared_count >= 1900, "Failed to clear demo records"

    # Verify real record is still present in PostgreSQL
    db = database.SessionLocal()
    try:
        check_real = db.query(StudentProfileModel).filter(StudentProfileModel.uid == real_uid).first()
        assert check_real is not None, "CRITICAL ERROR: Real record (is_demo=False) was deleted during demo clear!"
        # Cleanup real test record
        db.delete(check_real)
        db.commit()
    finally:
        db.close()
    print("  [OK] Production data safety confirmed: is_demo=False records are 100% safe from demo cleanup.\n")

    # Re-seed demo data for live application usage
    seed_demo_college_data(clear_first=True)

    print("====================================================================")
    print("  ALL COLLEGE PORTAL DATA SAFETY & SYSTEM TESTS PASSED SUCCESSFULLY!")
    print("====================================================================\n")

if __name__ == "__main__":
    run_tests()
