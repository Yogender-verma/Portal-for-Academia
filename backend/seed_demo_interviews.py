"""
SkillBridge — Demo Interview Requests Seeder

Seeds realistic demo interview data stored in PostgreSQL for the Company Interviews section.
Organized into 3 AI-generated role-based batches matching active company hiring roles:
  1. AI Role Batch #1: Frontend Developer Intern
  2. AI Role Batch #2: Full Stack Engineer
  3. AI Role Batch #3: Backend Node.js Intern

All records are stored in PostgreSQL (`interview_requests` table) with `is_demo=True`.

Usage:
    python backend/seed_demo_interviews.py           # Seed/update demo interviews
    python backend/seed_demo_interviews.py --clear    # Clear demo interviews only
"""

import os
import sys
import logging
import datetime
import argparse

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
from database import init_db, SessionLocal, InterviewRequestModel, StudentProfileModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("skillbridge.seed_demo_interviews")

COMPANY_UID = "company_acme_corp"
COMPANY_NAME = "Acme AI Corp"
COMPANY_EMAIL = "recruiter@acme.com"

DEMO_INTERVIEWS = [
    # =========================================================================
    # BATCH 1: AI Role Batch 1 - Frontend Developer Intern
    # =========================================================================
    # --- Completed Interviews ---
    {
        "id": "demo_ir_b1_c1",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_02",
        "opportunity_id": "opp-1",
        "opportunity_title": "Frontend Developer Intern",
        "opportunity_type": "internship",
        "interview_type": "Technical & Live UI Coding",
        "proposed_date": "2026-09-08",
        "proposed_time": "11:00 AM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-frontend-01",
        "message": "Technical round to evaluate React 19 state management, accessibility, and UI performance.",
        "status": "COMPLETED",
        "is_demo": True,
        "batch_name": "AI Role Batch 1 - Frontend Developer Intern",
        "feedback": "Outstanding candidate! Demonstrated deep mastery of React concurrent rendering, custom hooks, and WCAG AA accessibility standards. Solved live UI component task in under 15 mins. Strongly recommended for hire.",
        "rating": "4.9 / 5.0",
        "skill_match": "98%",
        "assessment_score": "96 / 100"
    },
    {
        "id": "demo_ir_b1_c2",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_08",
        "opportunity_id": "opp-1",
        "opportunity_title": "Frontend Developer Intern",
        "opportunity_type": "internship",
        "interview_type": "UI/UX & Component Design",
        "proposed_date": "2026-09-09",
        "proposed_time": "02:30 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-frontend-02",
        "message": "Component architecture review and design system integration round.",
        "status": "COMPLETED",
        "is_demo": True,
        "batch_name": "AI Role Batch 1 - Frontend Developer Intern",
        "feedback": "Great aesthetic sense and strong understanding of Framer Motion + Tailwind CSS. Code structure was modular and well-documented. Passed technical evaluation with high score.",
        "rating": "4.7 / 5.0",
        "skill_match": "95%",
        "assessment_score": "91 / 100"
    },
    {
        "id": "demo_ir_b1_c3",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_01",
        "opportunity_id": "opp-1",
        "opportunity_title": "Frontend Developer Intern",
        "opportunity_type": "internship",
        "interview_type": "Technical Round",
        "proposed_date": "2026-09-10",
        "proposed_time": "10:00 AM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-frontend-03",
        "message": "Frontend data fetching and state synchronization interview.",
        "status": "COMPLETED",
        "is_demo": True,
        "batch_name": "AI Role Batch 1 - Frontend Developer Intern",
        "feedback": "Showcased solid TypeScript typing and clean React component patterns. Handled edge cases during state hydration effectively.",
        "rating": "4.8 / 5.0",
        "skill_match": "96%",
        "assessment_score": "95 / 100"
    },
    # --- Pending Interviews ---
    {
        "id": "demo_ir_b1_p1",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_06",
        "opportunity_id": "opp-1",
        "opportunity_title": "Frontend Developer Intern",
        "opportunity_type": "internship",
        "interview_type": "Technical Round 1",
        "proposed_date": "2026-09-14",
        "proposed_time": "03:00 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-frontend-p1",
        "message": "Scheduled upcoming interview round for mobile-first frontend development capabilities.",
        "status": "SCHEDULED",
        "is_demo": True,
        "batch_name": "AI Role Batch 1 - Frontend Developer Intern",
        "feedback": "Interview slot confirmed by candidate. Pending technical evaluation.",
        "rating": "Pending Evaluation",
        "skill_match": "94%",
        "assessment_score": "88 / 100"
    },
    {
        "id": "demo_ir_b1_p2",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_04",
        "opportunity_id": "opp-1",
        "opportunity_title": "Frontend Developer Intern",
        "opportunity_type": "internship",
        "interview_type": "System & Component Design",
        "proposed_date": "2026-09-15",
        "proposed_time": "04:30 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-frontend-p2",
        "message": "Invitation sent based on high compiler test score (97/100). Awaiting candidate confirmation.",
        "status": "PENDING",
        "is_demo": True,
        "batch_name": "AI Role Batch 1 - Frontend Developer Intern",
        "feedback": "Awaiting response to interview invitation sent on 11 Sep.",
        "rating": "Pending Evaluation",
        "skill_match": "93%",
        "assessment_score": "97 / 100"
    },
    {
        "id": "demo_ir_b1_p3",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_05",
        "opportunity_id": "opp-1",
        "opportunity_title": "Frontend Developer Intern",
        "opportunity_type": "internship",
        "interview_type": "Final Hiring Manager Round",
        "proposed_date": "2026-09-16",
        "proposed_time": "11:30 AM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-frontend-p3",
        "message": "Candidate accepted invitation for final interview round.",
        "status": "ACCEPTED",
        "is_demo": True,
        "batch_name": "AI Role Batch 1 - Frontend Developer Intern",
        "feedback": "Candidate accepted interview slot. Final round scheduled with Engineering Lead.",
        "rating": "Pending Evaluation",
        "skill_match": "90%",
        "assessment_score": "94 / 100"
    },

    # =========================================================================
    # BATCH 2: AI Role Batch 2 - Full Stack Engineer
    # =========================================================================
    # --- Completed Interviews ---
    {
        "id": "demo_ir_b2_c1",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_01",
        "opportunity_id": "opp-2",
        "opportunity_title": "Full Stack Engineer",
        "opportunity_type": "job",
        "interview_type": "Full Stack Architecture & Coding",
        "proposed_date": "2026-09-07",
        "proposed_time": "02:00 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-fullstack-01",
        "message": "In-depth review of microservices architecture, REST endpoints, and React frontend.",
        "status": "COMPLETED",
        "is_demo": True,
        "batch_name": "AI Role Batch 2 - Full Stack Engineer",
        "feedback": "Exceptional full stack capabilities! Built end-to-end feature with React + Express + PostgreSQL within the allocated timeframe. Solved concurrency lock issue effortlessly.",
        "rating": "5.0 / 5.0",
        "skill_match": "96%",
        "assessment_score": "95 / 100"
    },
    {
        "id": "demo_ir_b2_c2",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_03",
        "opportunity_id": "opp-2",
        "opportunity_title": "Full Stack Engineer",
        "opportunity_type": "job",
        "interview_type": "Backend & Database Deep Dive",
        "proposed_date": "2026-09-09",
        "proposed_time": "04:00 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-fullstack-02",
        "message": "Technical interview focusing on Python FastAPI, PostgreSQL query optimization, and Redis.",
        "status": "COMPLETED",
        "is_demo": True,
        "batch_name": "AI Role Batch 2 - Full Stack Engineer",
        "feedback": "Very strong backend foundation. Demonstrated clear understanding of database indexing, query execution plans, and idempotent API design. Passed with high recommendation.",
        "rating": "4.8 / 5.0",
        "skill_match": "97%",
        "assessment_score": "99 / 100"
    },
    {
        "id": "demo_ir_b2_c3",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_11",
        "opportunity_id": "opp-2",
        "opportunity_title": "Full Stack Engineer",
        "opportunity_type": "job",
        "interview_type": "System Design & Java Spring",
        "proposed_date": "2026-09-10",
        "proposed_time": "03:00 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-fullstack-03",
        "message": "Evaluation of enterprise Java backend and microservices design patterns.",
        "status": "COMPLETED",
        "is_demo": True,
        "batch_name": "AI Role Batch 2 - Full Stack Engineer",
        "feedback": "Solid understanding of Spring Boot, transaction management, and relational database schema design. Good communication skills.",
        "rating": "4.6 / 5.0",
        "skill_match": "94%",
        "assessment_score": "89 / 100"
    },
    # --- Pending Interviews ---
    {
        "id": "demo_ir_b2_p1",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_10",
        "opportunity_id": "opp-2",
        "opportunity_title": "Full Stack Engineer",
        "opportunity_type": "job",
        "interview_type": "AI Integration & Full Stack Round",
        "proposed_date": "2026-09-14",
        "proposed_time": "01:00 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-fullstack-p1",
        "message": "Interview slot accepted by candidate for Full Stack Engineer position.",
        "status": "ACCEPTED",
        "is_demo": True,
        "batch_name": "AI Role Batch 2 - Full Stack Engineer",
        "feedback": "Candidate accepted interview request. Scheduled to evaluate ML model integration in web applications.",
        "rating": "Pending Evaluation",
        "skill_match": "96%",
        "assessment_score": "93 / 100"
    },
    {
        "id": "demo_ir_b2_p2",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_05",
        "opportunity_id": "opp-2",
        "opportunity_title": "Full Stack Engineer",
        "opportunity_type": "job",
        "interview_type": "DevOps & Cloud Architecture",
        "proposed_date": "2026-09-15",
        "proposed_time": "05:00 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-fullstack-p2",
        "message": "Interview invitation sent based on cloud infrastructure and Docker experience.",
        "status": "PENDING",
        "is_demo": True,
        "batch_name": "AI Role Batch 2 - Full Stack Engineer",
        "feedback": "Pending candidate response.",
        "rating": "Pending Evaluation",
        "skill_match": "91%",
        "assessment_score": "94 / 100"
    },
    {
        "id": "demo_ir_b2_p3",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_12",
        "opportunity_id": "opp-2",
        "opportunity_title": "Full Stack Engineer",
        "opportunity_type": "job",
        "interview_type": "Technical Coding Round",
        "proposed_date": "2026-09-16",
        "proposed_time": "02:00 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-fullstack-p3",
        "message": "Scheduled technical interview round for serverless and Go backend development.",
        "status": "SCHEDULED",
        "is_demo": True,
        "batch_name": "AI Role Batch 2 - Full Stack Engineer",
        "feedback": "Confirmed on recruiter calendar.",
        "rating": "Pending Evaluation",
        "skill_match": "89%",
        "assessment_score": "85 / 100"
    },

    # =========================================================================
    # BATCH 3: AI Role Batch 3 - Backend Node.js Intern
    # =========================================================================
    # --- Completed Interviews ---
    {
        "id": "demo_ir_b3_c1",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_03",
        "opportunity_id": "opp-3",
        "opportunity_title": "Backend Node.js Intern",
        "opportunity_type": "internship",
        "interview_type": "Node.js System & API Performance",
        "proposed_date": "2026-09-08",
        "proposed_time": "03:30 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-backend-01",
        "message": "Deep dive into Node.js event loop, asynchronous IO, and Express routing.",
        "status": "COMPLETED",
        "is_demo": True,
        "batch_name": "AI Role Batch 3 - Backend Node.js Intern",
        "feedback": "Exceptional backend knowledge! Explained non-blocking event loop mechanism, connection pooling, and stream processing brilliantly. Perfect 100/100 candidate.",
        "rating": "5.0 / 5.0",
        "skill_match": "97%",
        "assessment_score": "99 / 100"
    },
    {
        "id": "demo_ir_b3_c2",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_01",
        "opportunity_id": "opp-3",
        "opportunity_title": "Backend Node.js Intern",
        "opportunity_type": "internship",
        "interview_type": "REST API & ORM Round",
        "proposed_date": "2026-09-09",
        "proposed_time": "12:00 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-backend-02",
        "message": "Technical evaluation of Node.js + PostgreSQL database integration.",
        "status": "COMPLETED",
        "is_demo": True,
        "batch_name": "AI Role Batch 3 - Backend Node.js Intern",
        "feedback": "Strong grip on SQL queries, Prisma ORM, and JWT authentication flow. Passed code refactoring challenge easily.",
        "rating": "4.8 / 5.0",
        "skill_match": "95%",
        "assessment_score": "95 / 100"
    },
    {
        "id": "demo_ir_b3_c3",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_07",
        "opportunity_id": "opp-3",
        "opportunity_title": "Backend Node.js Intern",
        "opportunity_type": "internship",
        "interview_type": "Security & Middleware Evaluation",
        "proposed_date": "2026-09-10",
        "proposed_time": "05:00 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-backend-03",
        "message": "Interview focusing on API rate-limiting, CORS, and sanitization middleware.",
        "status": "COMPLETED",
        "is_demo": True,
        "batch_name": "AI Role Batch 3 - Backend Node.js Intern",
        "feedback": "Impressive security mindset. Built custom express-rate-limit middleware live during interview. Recommended for backend security assignments.",
        "rating": "4.7 / 5.0",
        "skill_match": "92%",
        "assessment_score": "86 / 100"
    },
    # --- Pending Interviews ---
    {
        "id": "demo_ir_b3_p1",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_05",
        "opportunity_id": "opp-3",
        "opportunity_title": "Backend Node.js Intern",
        "opportunity_type": "internship",
        "interview_type": "Docker & Containerized API Round",
        "proposed_date": "2026-09-14",
        "proposed_time": "10:30 AM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-backend-p1",
        "message": "Candidate accepted interview for Node.js microservices round.",
        "status": "ACCEPTED",
        "is_demo": True,
        "batch_name": "AI Role Batch 3 - Backend Node.js Intern",
        "feedback": "Confirmed by candidate. Technical lead will evaluate Docker multi-stage builds and Redis cache integration.",
        "rating": "Pending Evaluation",
        "skill_match": "93%",
        "assessment_score": "94 / 100"
    },
    {
        "id": "demo_ir_b3_p2",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_09",
        "opportunity_id": "opp-3",
        "opportunity_title": "Backend Node.js Intern",
        "opportunity_type": "internship",
        "interview_type": "C++ & Node.js Native Addons",
        "proposed_date": "2026-09-15",
        "proposed_time": "01:30 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-backend-p2",
        "message": "Invitation sent to candidate based on C++ and backend systems background.",
        "status": "PENDING",
        "is_demo": True,
        "batch_name": "AI Role Batch 3 - Backend Node.js Intern",
        "feedback": "Awaiting response to interview invitation.",
        "rating": "Pending Evaluation",
        "skill_match": "88%",
        "assessment_score": "82 / 100"
    },
    {
        "id": "demo_ir_b3_p3",
        "company_uid": COMPANY_UID,
        "company_name": COMPANY_NAME,
        "company_email": COMPANY_EMAIL,
        "student_uid": "demo_student_11",
        "opportunity_id": "opp-3",
        "opportunity_title": "Backend Node.js Intern",
        "opportunity_type": "internship",
        "interview_type": "Database Schema & API Design",
        "proposed_date": "2026-09-16",
        "proposed_time": "04:00 PM IST",
        "mode": "online",
        "meeting_link": "https://meet.google.com/sih-demo-backend-p3",
        "message": "Scheduled interview for backend data models and SQL query performance.",
        "status": "SCHEDULED",
        "is_demo": True,
        "batch_name": "AI Role Batch 3 - Backend Node.js Intern",
        "feedback": "Scheduled on calendar.",
        "rating": "Pending Evaluation",
        "skill_match": "91%",
        "assessment_score": "89 / 100"
    }
]

def clear_demo_interviews(db=None) -> int:
    """Removes ONLY demo interview records where is_demo=True."""
    close_db = False
    if db is None:
        init_db()
        db = database.SessionLocal()
        close_db = True

    try:
        deleted = db.query(InterviewRequestModel).filter(InterviewRequestModel.is_demo == True).delete(synchronize_session=False)
        db.commit()
        logger.info(f"Cleared {deleted} demo interview records (is_demo=True) from PostgreSQL.")
        return deleted
    except Exception as err:
        db.rollback()
        logger.error(f"Error clearing demo interviews: {err}")
        return 0
    finally:
        if close_db:
            db.close()

def seed_demo_interviews(clear_first: bool = False, db=None) -> int:
    """Seeds 18 realistic demo interview records across 3 AI role batches in PostgreSQL."""
    init_db()
    close_db = False
    if db is None:
        db = database.SessionLocal()
        close_db = True

    try:
        if clear_first:
            clear_demo_interviews(db=db)

        count = 0
        now = datetime.datetime.now(datetime.timezone.utc)

        for data in DEMO_INTERVIEWS:
            rec = db.query(InterviewRequestModel).filter(InterviewRequestModel.id == data["id"]).first()
            if rec:
                for k, v in data.items():
                    setattr(rec, k, v)
                rec.updated_at = now
            else:
                rec = InterviewRequestModel(
                    id=data["id"],
                    company_uid=data["company_uid"],
                    company_name=data["company_name"],
                    company_email=data["company_email"],
                    student_uid=data["student_uid"],
                    opportunity_id=data["opportunity_id"],
                    opportunity_title=data["opportunity_title"],
                    opportunity_type=data["opportunity_type"],
                    interview_type=data["interview_type"],
                    proposed_date=data["proposed_date"],
                    proposed_time=data["proposed_time"],
                    mode=data["mode"],
                    meeting_link=data["meeting_link"],
                    message=data["message"],
                    status=data["status"],
                    is_demo=True,
                    batch_name=data["batch_name"],
                    feedback=data["feedback"],
                    rating=data["rating"],
                    skill_match=data["skill_match"],
                    assessment_score=data["assessment_score"],
                    created_at=now,
                    updated_at=now
                )
                db.add(rec)
            count += 1

        db.commit()
        logger.info(f"Successfully seeded {count} demo interviews into PostgreSQL across 3 AI-generated role batches.")
        return count
    except Exception as err:
        db.rollback()
        logger.error(f"Error seeding demo interviews: {err}")
        raise
    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed demo interview requests into PostgreSQL.")
    parser.add_argument("--clear", action="store_true", help="Clear existing demo interviews (is_demo=True)")
    args = parser.parse_args()

    if args.clear:
        clear_demo_interviews()
    else:
        seed_demo_interviews(clear_first=True)
