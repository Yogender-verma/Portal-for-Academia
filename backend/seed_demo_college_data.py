"""
SkillBridge — Realistic Demo College Data & Placement Seeder (~2,000 Students)

Seeds a realistic 4-year engineering college population of ~2,000 students across 8 semesters and 7 departments into PostgreSQL for the College Portal.

PLACEMENT LOGIC:
- 1st, 2nd, 3rd Year & 4-1 students: Not Placed (Placement Status: Not Eligible / Drive Active).
- 4-2 Semester students (~250 students): Placement-eligible cohort.
- ~170 4-2 students placed (~68% placement rate) with placement records in PostgreSQL.

Usage:
    python backend/seed_demo_college_data.py           # Seed demo institutional data
    python backend/seed_demo_college_data.py --clear    # Purge ONLY demo records (is_demo=True)
"""

import os
import sys
import random
import logging
import datetime
import argparse

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
from database import init_db, StudentProfileModel, PlacementRecordModel, InterviewRequestModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("skillbridge.seed_college")

DEFAULT_COLLEGE_UID = "college_demo_nit_01"

FIRST_NAMES = [
    "Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Meera", "Arjun", "Sneha", "Karthik", "Diya",
    "Varun", "Nisha", "Sahil", "Ishani", "Hemant", "Chetan", "Aditya", "Kavya", "Rahul", "Pooja",
    "Siddharth", "Riya", "Dev", "Tanvi", "Yash", "Shruti", "Akash", "Bhavna", "Manish", "Divya",
    "Manav", "Isha", "Nikhil", "Neha", "Tarun", "Simran", "Aman", "Payal", "Pranav", "Swati",
    "Gaurav", "Anushka", "Karan", "Rashmi", "Ayush", "Rupal", "Mayank", "Shreya", "Harsh", "Deepika",
    "Abhinav", "Charu", "Dhruv", "Ekta", "Farhan", "Gitanjali", "Inder", "Jhanvi", "Kabir", "Lata"
]

LAST_NAMES = [
    "Sharma", "Patel", "Gupta", "Roy", "Singh", "Bose", "Kapoor", "Deshmukh", "Iyer", "Rajan",
    "Banerjee", "Saxena", "Sundaram", "Bisht", "Bhagat", "Verma", "Joshi", "Nair", "Reddy", "Mehta",
    "Chowdhury", "Rao", "Mishra", "Trivedi", "Kulkarni", "Aggarwal", "Pandey", "Dutta", "Shenoy", "Bhat",
    "Pillai", "Chopra", "Shah", "Malhotra", "Nambiar", "Sen", "Goel", "Thakur", "Yadav", "Dhar",
    "Mukherjee", "Kaushik", "Venkatesh", "Deshpande", "Chatterjee", "Tripathi", "Menon", "Prasad", "Sinha", "Shukla"
]

DEPARTMENTS = ["Computer Science", "AI & ML", "DS", "ECE"]

DEPT_SHORT_CODES = {
    "Computer Science": "CSE",
    "AI & ML": "AIML",
    "DS": "DS",
    "ECE": "ECE"
}

DEPT_SKILLS = {
    "Computer Science": ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Python", "Tailwind CSS", "Java", "C++", "FastAPI"],
    "AI & ML": ["Python", "PyTorch", "TensorFlow", "SQL", "Pandas", "Scikit-Learn", "OpenCV", "Deep Learning", "FastAPI", "NLP", "LLM Fine-Tuning"],
    "DS": ["Python", "R", "SQL", "Pandas", "NumPy", "Tableau", "Power BI", "Statistics", "Big Data", "Machine Learning"],
    "ECE": ["Embedded C", "C++", "ARM Cortex", "IoT", "Python", "Verilog", "RTOS", "MATLAB", "Circuit Design", "SystemVerilog", "DSP"]
}

DEPT_TARGET_ROLES = {
    "Computer Science": ["Full Stack Developer", "Frontend Developer", "Backend Engineer", "Software Engineer", "DevOps Engineer"],
    "AI & ML": ["AI/ML Engineer", "Data Scientist", "Computer Vision Engineer", "Data Engineer", "NLP Engineer"],
    "DS": ["Data Analyst", "Data Scientist", "Business Intelligence Analyst", "Data Engineer", "Analytics Consultant"],
    "ECE": ["Embedded Systems Engineer", "VLSI Engineer", "IoT Engineer", "Hardware Engineer", "Robotics Engineer"]
}

HIRING_COMPANIES = [
    {"name": "Acme AI Corp", "base_lpa": 18.5, "roles": ["Full Stack Developer", "AI/ML Engineer", "Data Scientist"]},
    {"name": "Microsoft India", "base_lpa": 24.0, "roles": ["Software Engineer", "Cloud Engineer", "Backend Engineer"]},
    {"name": "Adobe Systems", "base_lpa": 28.5, "roles": ["Data Scientist", "Software Engineer", "AI/ML Engineer"]},
    {"name": "Swiggy Labs", "base_lpa": 16.0, "roles": ["Frontend Developer", "Full Stack Developer", "Backend Engineer"]},
    {"name": "Flipkart", "base_lpa": 19.0, "roles": ["Backend Engineer", "Software Engineer", "Cloud Engineer"]},
    {"name": "Amazon India", "base_lpa": 22.0, "roles": ["Software Engineer", "DevOps Engineer", "Cloud Engineer"]},
    {"name": "Texas Instruments", "base_lpa": 14.5, "roles": ["Embedded Systems Engineer", "VLSI Engineer", "Hardware Engineer"]},
    {"name": "Bosch India", "base_lpa": 12.5, "roles": ["IoT Engineer", "Embedded Systems Engineer", "Automation Engineer"]},
    {"name": "TCS Digital", "base_lpa": 9.0, "roles": ["Software Engineer", "Full Stack Developer", "Electrical Engineer"]},
    {"name": "L&T Engineering", "base_lpa": 8.5, "roles": ["Mechanical Design Engineer", "Structural Engineer", "Civil Site Engineer"]},
    {"name": "Tata Motors", "base_lpa": 10.5, "roles": ["Mechanical Design Engineer", "Control Systems Engineer", "Robotics Engineer"]},
    {"name": "CrowdStrike", "base_lpa": 17.5, "roles": ["Security Analyst", "Backend Engineer", "DevOps Engineer"]},
    {"name": "PhonePe", "base_lpa": 20.0, "roles": ["Mobile Developer", "Software Engineer", "Backend Engineer"]},
    {"name": "Razorpay", "base_lpa": 21.0, "roles": ["Backend Engineer", "Full Stack Developer", "Software Engineer"]}
]

SEMESTER_CONFIGS = [
    # (year_label, sem_code, grad_year, base_readiness_min, base_readiness_max)
    ("1st Year", "1-1", "2029", 35, 50),
    ("1st Year", "1-2", "2029", 40, 55),
    ("2nd Year", "2-1", "2028", 50, 64),
    ("2nd Year", "2-2", "2028", 55, 70),
    ("3rd Year", "3-1", "2027", 65, 76),
    ("3rd Year", "3-2", "2027", 70, 82),
    ("4th Year", "4-1", "2026", 75, 90),
    ("4th Year", "4-2", "2025", 60, 98),
]


def generate_student_population(total_students: int = 2000, active_departments: list = None) -> list:
    """Generates ~2,000 realistic student dictionaries across 8 semesters and 4 active departments with exact realistic distribution."""
    students = []
    random.seed(42)  # Deterministic seed for reproducible population

    departments_to_use = [d.strip() for d in active_departments if d and str(d).strip()] if active_departments else DEPARTMENTS
    if not departments_to_use:
        departments_to_use = DEPARTMENTS

    # Generate exact weighted pool matching target ratios: 700 Computer Science, 500 AI & ML, 400 DS, 400 ECE
    if set(departments_to_use) == set(DEPARTMENTS):
        target_dept_pool = (
            ["Computer Science"] * 700 +
            ["AI & ML"] * 500 +
            ["DS"] * 400 +
            ["ECE"] * 400
        )
        random.seed(42)
        random.shuffle(target_dept_pool)
    else:
        target_dept_pool = [departments_to_use[i % len(departments_to_use)] for i in range(total_students)]

    # Generate 3,000 unique full names and shuffle deterministically
    unique_names_pool = [f"{fn} {ln}" for fn in FIRST_NAMES for ln in LAST_NAMES]
    random.shuffle(unique_names_pool)

    students_per_sem = total_students // len(SEMESTER_CONFIGS)  # ~250 per semester
    remainder = total_students % len(SEMESTER_CONFIGS)

    std_index = 1
    for sem_idx, (year_label, sem_code, grad_year, r_min, r_max) in enumerate(SEMESTER_CONFIGS):
        count_for_this_sem = students_per_sem + (remainder if sem_idx == len(SEMESTER_CONFIGS) - 1 else 0)
        
        # Calculate dynamic placement target for 4-2 final year cohort (~68% placement rate)
        placed_target_count = int(count_for_this_sem * 0.68) if sem_code == "4-2" else 0

        for idx in range(count_for_this_sem):
            uid = f"demo_college_std_{std_index:04d}"
            name = unique_names_pool[(std_index - 1) % len(unique_names_pool)]

            dept = target_dept_pool[(std_index - 1) % len(target_dept_pool)]
            dept_code = DEPT_SHORT_CODES.get(dept, "".join([w[0] for w in dept.split() if w]).upper()[:5])
            dept_skills = DEPT_SKILLS.get(dept, ["Python", "SQL", "JavaScript", "React", "PostgreSQL", "Docker", "Git", "FastAPI"])
            dept_roles = DEPT_TARGET_ROLES.get(dept, ["Software Engineer", "Full Stack Developer", "Data Analyst", "Systems Engineer", "Cloud Developer"])
            role = random.choice(dept_roles)

            # Pick 4-6 skills
            skills = random.sample(dept_skills, min(len(dept_skills), random.randint(4, 6)))

            # CGPA
            cgpa_val = round(random.uniform(6.8, 9.8), 1)
            cgpa_str = f"{cgpa_val} / 10.0"

            # Readiness & Assessment Scores based on semester
            if sem_code == "4-2":
                # Dynamic Placement calculation for 4-2 cohort
                is_placed = (idx < placed_target_count)
                if is_placed:
                    readiness = random.randint(80, 98)
                    skill_score = random.randint(84, 98)
                    comp_info = random.choice(HIRING_COMPANIES)
                    company_placed = comp_info["name"]
                    # Adjust package LPA with minor variance
                    package_lpa = round(comp_info["base_lpa"] + random.uniform(-1.5, 2.5), 1)
                    placement_status = f"Placed ({company_placed} - ₹{package_lpa} LPA)"
                    internship_status = f"Completed ({company_placed})"
                else:
                    readiness = random.randint(60, 78)
                    skill_score = random.randint(62, 78)
                    company_placed = ""
                    package_lpa = 0.0
                    placement_status = "Drive Active"
                    internship_status = random.choice(["Completed", "None", "Applied"])
            elif sem_code == "4-1":
                readiness = random.randint(r_min, r_max)
                skill_score = random.randint(r_min + 2, min(96, r_max + 4))
                company_placed = ""
                package_lpa = 0.0
                placement_status = "Drive Active"
                internship_status = random.choice(["Completed", "Active", "Shortlisted"])
            elif sem_code in ["3-1", "3-2"]:
                readiness = random.randint(r_min, r_max)
                skill_score = random.randint(r_min, r_max + 5)
                company_placed = ""
                package_lpa = 0.0
                placement_status = "Not Eligible"
                internship_status = random.choice(["Active", "Completed", "Applied", "Interview Scheduled"])
            elif sem_code in ["2-1", "2-2"]:
                readiness = random.randint(r_min, r_max)
                skill_score = random.randint(r_min - 2, r_max + 3)
                company_placed = ""
                package_lpa = 0.0
                placement_status = "Not Eligible"
                internship_status = random.choice(["None", "Applied", "Active"])
            else:  # 1-1, 1-2
                readiness = random.randint(r_min, r_max)
                skill_score = random.randint(35, 60)
                company_placed = ""
                package_lpa = 0.0
                placement_status = "Not Eligible"
                internship_status = random.choice(["None", "None", "Applied"])

            # Readiness Tier Category
            if readiness >= 75:
                priority_category = "Placement Ready"
            elif readiness >= 60:
                priority_category = "Nearly Ready"
            elif readiness >= 45:
                priority_category = "Needs Improvement"
            else:
                priority_category = "High Priority"

            roadmap_progress = min(100, max(20, int(readiness * random.uniform(0.9, 1.05))))

            student_obj = {
                "uid": uid,
                "name": name,
                "department": dept,
                "dept_code": dept_code,
                "year_label": year_label,
                "semester": sem_code,
                "graduation_year": grad_year,
                "targetRole": role,
                "cgpa": cgpa_str,
                "skillScore": skill_score,
                "readiness": readiness,
                "roadmap": roadmap_progress,
                "assessmentScore": skill_score,
                "skills": skills,
                "internshipStatus": internship_status,
                "placementStatus": placement_status,
                "packageLpa": package_lpa,
                "companyPlaced": company_placed,
                "priorityCategory": priority_category,
                "is_demo": True
            }
            students.append(student_obj)
            std_index += 1

    return students


def clear_demo_college_data(db=None) -> int:
    """Purges ONLY demo records (is_demo=True) from PostgreSQL."""
    close_db = False
    if db is None:
        init_db()
        db = database.SessionLocal()
        close_db = True

    try:
        del_placements = db.query(PlacementRecordModel).filter(PlacementRecordModel.is_demo == True).delete(synchronize_session=False)
        del_students = db.query(StudentProfileModel).filter(StudentProfileModel.is_demo == True).delete(synchronize_session=False)
        del_interviews = db.query(InterviewRequestModel).filter(InterviewRequestModel.is_demo == True).delete(synchronize_session=False)
        db.commit()
        total_deleted = del_placements + del_students + del_interviews
        logger.info(f"Cleared {total_deleted} demo records (Placements: {del_placements}, Students: {del_students}, Interviews: {del_interviews}) from PostgreSQL.")
        return total_deleted
    except Exception as err:
        db.rollback()
        logger.error(f"Error clearing demo college data: {err}")
        return 0
    finally:
        if close_db:
            db.close()


def seed_demo_college_data(clear_first: bool = False, db=None) -> dict:
    """Seeds ~2,000 realistic student profiles into PostgreSQL with is_demo=True using configured College Profile departments."""
    init_db()
    close_db = False
    if db is None:
        db = database.SessionLocal()
        close_db = True

    try:
        if clear_first:
            clear_demo_college_data(db=db)

        # Enforce the 4 active departments as Single Source of Truth
        active_departments = DEPARTMENTS
        college_record = db.query(database.CollegeProfileModel).filter(database.CollegeProfileModel.uid == DEFAULT_COLLEGE_UID).first()
        if not college_record or not college_record.profile_data:
            college_record = db.query(database.CollegeProfileModel).first()

        if college_record and college_record.profile_data:
            college_record.profile_data["departments"] = DEPARTMENTS
            db.commit()

        raw_students = generate_student_population(2000, active_departments=active_departments)
        now = datetime.datetime.now(datetime.timezone.utc)

        student_count = 0
        placement_count = 0

        for sdata in raw_students:
            uid = sdata["uid"]

            profile_payload = {
                "personalInfo": {
                    "fullName": sdata["name"],
                    "location": "Bengaluru, India",
                    "aboutMe": f"Engineering student in {sdata['department']} ({sdata['year_label']}, Sem {sdata['semester']}), targeting {sdata['targetRole']}.",
                    "avatarUrl": f"https://api.dicebear.com/7.x/avataaars/svg?seed={sdata['name'].replace(' ', '')}"
                },
                "academicInfo": {
                    "institution": "National Institute of Technology & Engineering",
                    "college": "NIT Engineering",
                    "degree": "B.Tech",
                    "department": sdata["department"],
                    "year": sdata["year_label"],
                    "semester": sdata["semester"],
                    "graduationYear": sdata["graduation_year"],
                    "cgpa": sdata["cgpa"]
                },
                "careerPreferences": {
                    "targetRole": sdata["targetRole"],
                    "preferredLocations": ["Bengaluru", "Pune", "Remote"],
                    "workMode": "hybrid"
                },
                "technicalSkills": [
                    {"id": f"s-{i}", "name": sk, "proficiency": "Advanced" if sdata["readiness"] > 75 else "Intermediate", "score": sdata["skillScore"]}
                    for i, sk in enumerate(sdata["skills"])
                ],
                "softSkills": ["Problem Solving", "Teamwork", "Analytical Thinking", "Communication"],
                "projects": [
                    {
                        "id": "p1",
                        "projectName": f"{sdata['targetRole']} Capstone Project",
                        "description": f"Developed application using {', '.join(sdata['skills'][:3])}.",
                        "technologies": sdata["skills"][:4],
                        "role": "Lead Developer",
                        "githubUrl": "https://github.com/skillbridge/student-project"
                    }
                ],
                "experiences": [
                    {
                        "id": "e1",
                        "company": sdata["companyPlaced"] or "Tech Partner Corp",
                        "role": "Software Engineering Intern",
                        "duration": "3 Months",
                        "description": "Contributed to production modules."
                    }
                ] if sdata["internshipStatus"] not in ["None", ""] else [],
                "certifications": ["SkillBridge Industry Telemetry Certified"],
                "achievements": ["Academic Excellence & Skill Ranking"],
                "assessmentDetails": {
                    "testScore": sdata["assessmentScore"],
                    "testCasesPassed": "18 / 20 Passed" if sdata["assessmentScore"] < 85 else "20 / 20 Passed",
                    "executionTimeMs": 24,
                    "timeComplexity": "O(N log N)",
                    "codeQualityRating": "A+ Clean Code Compliant",
                    "solvedTopics": ["Data Structures", "Algorithms", "System Fundamentals"]
                },
                "roadmapProgress": sdata["roadmap"],
                "industryReadiness": sdata["readiness"],
                "internshipStatus": sdata["internshipStatus"],
                "placementStatus": sdata["placementStatus"],
                "priorityCategory": sdata["priorityCategory"],
                "metadata": {"is_demo": True}
            }

            rec = db.query(StudentProfileModel).filter(StudentProfileModel.uid == uid).first()
            if rec:
                rec.profile_data = profile_payload
                rec.is_demo = True
                rec.updated_at = now
            else:
                rec = StudentProfileModel(
                    uid=uid,
                    profile_data=profile_payload,
                    is_demo=True,
                    updated_at=now
                )
                db.add(rec)
            student_count += 1

            # Save PlacementRecordModel ONLY for placed 4-2 students
            if sdata["packageLpa"] > 0 and sdata["companyPlaced"]:
                p_id = f"plc-{uid}"
                plc_rec = db.query(PlacementRecordModel).filter(PlacementRecordModel.id == p_id).first()
                if plc_rec:
                    plc_rec.college_uid = DEFAULT_COLLEGE_UID
                    plc_rec.student_uid = uid
                    plc_rec.student_name = sdata["name"]
                    plc_rec.department = sdata["department"]
                    plc_rec.company_name = sdata["companyPlaced"]
                    plc_rec.role_title = sdata["targetRole"]
                    plc_rec.package_lpa = sdata["packageLpa"]
                    plc_rec.offer_date = "2026-08-15"
                    plc_rec.status = "ACCEPTED"
                    plc_rec.is_demo = True
                else:
                    plc_rec = PlacementRecordModel(
                        id=p_id,
                        college_uid=DEFAULT_COLLEGE_UID,
                        student_uid=uid,
                        student_name=sdata["name"],
                        department=sdata["department"],
                        company_name=sdata["companyPlaced"],
                        role_title=sdata["targetRole"],
                        package_lpa=sdata["packageLpa"],
                        offer_date="2026-08-15",
                        status="ACCEPTED",
                        is_demo=True,
                        created_at=now,
                        updated_at=now
                    )
                    db.add(plc_rec)
                placement_count += 1

        db.commit()
        logger.info(f"Successfully seeded {student_count} student profiles and {placement_count} placement records into PostgreSQL (is_demo=True).")

        # Query and print actual PostgreSQL counts for the 4 departments
        from sqlalchemy import text
        dept_counts = {
            "Computer Science": db.query(StudentProfileModel).filter(StudentProfileModel.is_demo == True, text("profile_data->'academicInfo'->>'department' IN ('Computer Science', 'CSE', 'Computer Science & Engineering')")).count(),
            "AI & ML": db.query(StudentProfileModel).filter(StudentProfileModel.is_demo == True, text("profile_data->'academicInfo'->>'department' IN ('AI & ML', 'Artificial Intelligence & Machine Learning')")).count(),
            "DS": db.query(StudentProfileModel).filter(StudentProfileModel.is_demo == True, text("profile_data->'academicInfo'->>'department' IN ('DS', 'Data Science & Analytics')")).count(),
            "ECE": db.query(StudentProfileModel).filter(StudentProfileModel.is_demo == True, text("profile_data->'academicInfo'->>'department' IN ('ECE', 'Electronics & Communication Engineering')")).count(),
        }

        print("\n" + "=" * 70)
        print("  ACTUAL POSTGRESQL DEMO STUDENT COUNTS BY DEPARTMENT")
        print("=" * 70)
        for code_label, cnt in dept_counts.items():
            print(f"  - {code_label}: {cnt}")
        total_seeded = sum(dept_counts.values())
        print(f"  TOTAL DEMO STUDENTS IN POSTGRESQL: {total_seeded}")
        print("=" * 70 + "\n")

        return {"students": student_count, "placements": placement_count}

    except Exception as err:
        db.rollback()
        logger.error(f"Error seeding demo college data: {err}")
        raise
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed demo college & placement data into PostgreSQL.")
    parser.add_argument("--clear", action="store_true", help="Clear existing demo college records (is_demo=True)")
    args = parser.parse_args()

    if args.clear:
        clear_demo_college_data()
    else:
        seed_demo_college_data(clear_first=True)
