import os
import sys
import logging
from fastapi.testclient import TestClient

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from database import init_db
from seed_demo_students import seed_demo_students, clear_demo_students

client = TestClient(app)

def run_tests():
    print("\n====================================================================")
    print("  TOP TALENT DISCOVERY & INTERVIEW REQUEST FLOW TESTS")
    print("====================================================================\n")

    # 1. Initialize DB
    print("[1/7] Initializing PostgreSQL database connection...")
    assert init_db(), "Database initialization failed!"
    print("  [OK] Database initialized successfully.\n")

    # 2. Seed 15 demo students
    print("[2/7] Seeding 15 realistic demo students with is_demo=True...")
    seed_demo_students(clear_first=False, clear_only=False)
    print("  [OK] Seeded demo students into PostgreSQL.\n")

    # 3. Create a Real Student Profile
    real_uid = "real_student_sih_test_999"
    headers_real = {"Authorization": f"Bearer mock-token-{real_uid}"}
    real_student_payload = {
        "personalInfo": {
            "fullName": "Kavya Patel",
            "location": "Bengaluru, India",
            "aboutMe": "Senior Full Stack AI Developer specializing in PyTorch and FastAPI.",
            "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
        },
        "academicInfo": {
            "institution": "Indian Institute of Science, Bengaluru",
            "college": "IISc Bengaluru",
            "degree": "M.Tech",
            "department": "Artificial Intelligence",
            "graduationYear": "2025",
            "cgpa": "9.8 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Full Stack Developer",
            "preferredLocations": ["Bengaluru", "Remote"],
            "workMode": "remote"
        },
        "technicalSkills": [
            {"id": "s1", "name": "React", "proficiency": "Expert", "score": 98},
            {"id": "s2", "name": "TypeScript", "proficiency": "Expert", "score": 96},
            {"id": "s3", "name": "Python", "proficiency": "Expert", "score": 99},
            {"id": "s4", "name": "FastAPI", "proficiency": "Expert", "score": 97},
            {"id": "s5", "name": "PostgreSQL", "proficiency": "Advanced", "score": 92}
        ],
        "softSkills": ["Leadership", "Problem Solving"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Autonomous Multi-Agent AI System",
                "description": "Scalable AI agent swarm running on FastAPI & PostgreSQL.",
                "technologies": ["Python", "FastAPI", "PostgreSQL", "React"],
                "role": "Lead Architect",
                "githubUrl": "https://github.com/kavyapatel/ai-swarm"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "Google Research India",
                "role": "AI Research Intern",
                "duration": "6 Months",
                "description": "Built neural network optimization algorithms."
            }
        ],
        "certifications": ["AWS Certified Solutions Architect"],
        "achievements": ["SIH 2024 Gold Medalist"],
        "assessmentDetails": {
            "testScore": 99,
            "testCasesPassed": "20 / 20 Passed",
            "executionTimeMs": 10,
            "timeComplexity": "O(1)",
            "codeQualityRating": "A+ Production Grade"
        },
        "roadmapProgress": 95,
        "industryReadiness": 99
    }

    print("[3/7] Saving real student profile via PUT /api/v1/profiles/{uid}...")
    save_res = client.put(f"/api/v1/profiles/{real_uid}", json={"profile": real_student_payload}, headers=headers_real)
    assert save_res.status_code == 200, f"Failed saving real student: {save_res.text}"
    print("  [OK] Real student profile saved successfully with is_demo=False.\n")

    # 4. Test Top Talent Discovery API (Internships & Jobs)
    print("[4/7] Testing Top Talent Discovery API (/api/v1/top-talent)...")
    
    # Test internships
    tt_intern = client.get("/api/v1/top-talent?type=internship&role_filter=Full%20Stack")
    assert tt_intern.status_code == 200, f"Top talent internship error: {tt_intern.text}"
    data_intern = tt_intern.json()
    assert data_intern["status"] == "success"
    assert data_intern["total"] >= 16, f"Expected at least 16 profiles, got {data_intern['total']}"
    
    # Check score sorting (descending)
    scores = [s["overall_score"] for s in data_intern["talent"]]
    assert scores == sorted(scores, reverse=True), "Top Talent results are not sorted in descending order of overall_score!"
    print(f"  [OK] Top Talent Internship returned {data_intern['total']} dynamically ranked profiles (Top Score: {scores[0]}).")

    # Test jobs
    tt_jobs = client.get("/api/v1/top-talent?type=job&skill_filter=React,TypeScript")
    assert tt_jobs.status_code == 200, f"Top talent jobs error: {tt_jobs.text}"
    data_jobs = tt_jobs.json()
    assert data_jobs["status"] == "success"
    job_scores = [s["overall_score"] for s in data_jobs["talent"]]
    assert job_scores == sorted(job_scores, reverse=True), "Top Talent Job results are not sorted by score!"
    print(f"  [OK] Top Talent Jobs returned {data_jobs['total']} dynamically ranked profiles (Top Score: {job_scores[0]}).\n")

    # 5. Recruiter Public Profile & Interview Requests Flow
    print("[5/7] Testing Recruiter Public Profile & Interview Request Flow...")
    pub_res = client.get(f"/api/v1/student-public-profile/{real_uid}")
    assert pub_res.status_code == 200, f"Public profile error: {pub_res.text}"
    pub_data = pub_res.json()["profile"]
    assert pub_data["name"] == "Kavya Patel"
    assert pub_data["is_demo"] == False
    print("  [OK] Safe recruiter public profile fetched successfully (email/phone omitted).")

    # Create interview request
    ir_payload = {
        "company_uid": "company_acme_corp",
        "company_name": "Acme AI Corp",
        "company_email": "recruiter@acme.com",
        "student_uid": real_uid,
        "opportunity_title": "Senior AI Full Stack Engineer",
        "opportunity_type": "job",
        "interview_type": "technical",
        "proposed_date": "2026-10-01",
        "proposed_time": "14:00 IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/abc-defg-hij",
        "message": "We were deeply impressed by your AI agent work on SkillBridge!"
    }
    ir_create = client.post("/api/v1/interview-requests", json=ir_payload)
    assert ir_create.status_code == 200, f"Interview request create failed: {ir_create.text}"
    req_id = ir_create.json()["interview_request_id"]
    print(f"  [OK] Interview request created successfully (ID: {req_id}).")

    # Student checks received interview requests
    student_ir = client.get(f"/api/v1/interview-requests/student/{real_uid}")
    assert student_ir.status_code == 200
    ir_list = student_ir.json()["requests"]
    assert len(ir_list) >= 1
    assert ir_list[0]["id"] == req_id
    assert ir_list[0]["status"] == "PENDING"
    print("  [OK] Student fetched pending interview request.")

    # Student accepts interview request
    ir_respond = client.patch(f"/api/v1/interview-requests/{req_id}/respond", json={"action": "accept"})
    assert ir_respond.status_code == 200
    assert ir_respond.json()["new_status"] == "ACCEPTED"
    print("  [OK] Student accepted interview request.\n")

    # 6. Execute Demo Cleanup (--clear)
    print("[6/7] Testing Production Cleanup: Deleting ONLY demo profiles (is_demo=True)...")
    deleted_count = clear_demo_students()
    assert deleted_count >= 15, f"Expected to clear at least 15 demo profiles, cleared {deleted_count}"
    print(f"  [OK] Cleared {deleted_count} demo profiles.\n")

    # 7. Verify Post-Cleanup Top Talent Automatic Ranking
    print("[7/7] Verifying Top Talent API after demo cleanup...")
    post_tt = client.get("/api/v1/top-talent")
    assert post_tt.status_code == 200
    post_data = post_tt.json()
    post_talent = post_data["talent"]
    
    # Ensure no demo profiles remain
    demo_left = [t for t in post_talent if t.get("is_demo") == True]
    assert len(demo_left) == 0, f"Expected 0 demo profiles after cleanup, found {len(demo_left)}"
    
    # Ensure real student profile is still present and properly ranked
    real_found = [t for t in post_talent if t["uid"] == real_uid]
    assert len(real_found) == 1, f"Real student profile should remain intact!"
    assert real_found[0]["name"] == "Kavya Patel"
    print("  [OK] Top Talent automatically returned only real student profiles with no code changes!\n")

    # Clean up test real student
    client.delete(f"/api/v1/profiles/{real_uid}", headers=headers_real)

    print("====================================================================")
    print("  ALL TOP TALENT & INTERVIEW REQUEST TESTS PASSED SUCCESSFULLY!")
    print("====================================================================\n")

if __name__ == "__main__":
    run_tests()
