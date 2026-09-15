import os
import sys
import logging
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from database import init_db
from seed_demo_interviews import seed_demo_interviews, clear_demo_interviews

client = TestClient(app)

def run_tests():
    print("\n====================================================================")
    print("  COMPANY INTERVIEWS & AI ROLE BATCHES POSTGRESQL TESTS")
    print("====================================================================\n")

    # 1. Initialize DB
    print("[1/5] Initializing PostgreSQL database connection...")
    assert init_db(), "Database initialization failed!"
    print("  [OK] Database initialized successfully.\n")

    # 2. Seed 18 demo interviews
    print("[2/5] Seeding 18 realistic demo interviews across 3 AI role batches...")
    count = seed_demo_interviews(clear_first=True)
    assert count == 18, f"Expected 18 demo interviews, seeded {count}"
    print("  [OK] Seeded 18 demo interview records into PostgreSQL with is_demo=True.\n")

    # 3. Test Fetch Batches API
    print("[3/5] Testing GET /api/v1/company-interviews/batches...")
    res = client.get("/api/v1/company-interviews/batches?company_uid=company_acme_corp")
    assert res.status_code == 200, f"Fetch batches failed: {res.text}"
    data = res.json()
    assert data["status"] == "success"
    all_batches = data["batches"]
    batches = [b for b in all_batches if "AI Role Batch" in b["batch_name"]]
    assert len(batches) == 3, f"Expected 3 AI role batches, got {len(batches)}"

    for b in batches:
        print(f"  - Batch: '{b['batch_name']}' -> {b['completed_count']} Completed, {b['pending_count']} Pending (Total: {b['total_count']})")
        assert b["completed_count"] >= 1, "Expected at least 1 completed interview per batch"
        assert b["pending_count"] >= 1, "Expected at least 1 pending interview per batch"

        # Check completed interview structure
        comp = b["completed_interviews"][0]
        assert "student_name" in comp and comp["student_name"]
        assert "skill_match" in comp and comp["skill_match"]
        assert "assessment_score" in comp and comp["assessment_score"]
        assert "feedback" in comp and comp["feedback"]
        assert comp["is_demo"] == True

        # Check pending interview structure
        pend = b["pending_interviews"][0]
        assert "student_name" in pend and pend["student_name"]
        assert "proposed_date" in pend and pend["proposed_date"]
        assert pend["status"] in ["PENDING", "ACCEPTED", "SCHEDULED"]

    print("  [OK] Batches API returned 3 role-based batches with rich interview records.\n")

    # 4. Test Update Feedback API
    print("[4/5] Testing PATCH /api/v1/company-interviews/{interview_id}/feedback...")
    target_id = batches[0]["completed_interviews"][0]["id"]
    new_feedback = "Updated recruiter evaluation notes: Highly skilled candidate, approved for offer."
    new_rating = "5.0 / 5.0"
    
    patch_res = client.patch(f"/api/v1/company-interviews/{target_id}/feedback", json={
        "feedback": new_feedback,
        "rating": new_rating,
        "status": "COMPLETED"
    })
    assert patch_res.status_code == 200, f"Patch feedback failed: {patch_res.text}"
    patch_data = patch_res.json()
    assert patch_data["status"] == "success"
    assert patch_data["feedback"] == new_feedback
    assert patch_data["rating"] == new_rating
    print(f"  [OK] Successfully updated recruiter feedback & rating in PostgreSQL for ID {target_id}.\n")

    # 5. Clear Demo Interviews Cleanup Test
    print("[5/5] Testing Production Cleanup: Clearing ONLY demo interviews (is_demo=True)...")
    cleared_count = clear_demo_interviews()
    assert cleared_count == 18, f"Expected 18 cleared demo records, got {cleared_count}"
    
    # Re-seed for live application demo
    seed_demo_interviews(clear_first=True)
    print("  [OK] Cleanup and re-seeding verified successfully.\n")

    print("====================================================================")
    print("  ALL COMPANY INTERVIEW POSTGRESQL TESTS PASSED SUCCESSFULLY!")
    print("====================================================================\n")

if __name__ == "__main__":
    run_tests()
