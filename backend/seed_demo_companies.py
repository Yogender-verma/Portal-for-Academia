import os
import datetime
import logging
from sqlalchemy.orm import Session
import database
from database import get_db, CompanyProfileModel, init_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("skillbridge.seed_companies")

DEMO_COMPANIES = [
    {
        "id": "comp-demo-1",
        "userId": "demo-company-1",
        "companyName": "TechSpark Innovations",
        "officialEmail": "careers@techspark.io",
        "phoneNumber": "+91 98765 43210",
        "companyType": "MNC",
        "companySize": "1000+",
        "foundedYear": 2012,
        "website": "https://techspark.io",
        "linkedin": "https://linkedin.com/company/techspark-innovations",
        "description": "Leading enterprise software and AI solutions provider specializing in cloud migration, distributed systems, and intelligent analytics.",
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "id": "comp-demo-2",
        "userId": "demo-company-2",
        "companyName": "CloudScale Systems",
        "officialEmail": "recruitment@cloudscale.tech",
        "phoneNumber": "+91 98123 45678",
        "companyType": "Private",
        "companySize": "201-500",
        "foundedYear": 2018,
        "website": "https://cloudscale.tech",
        "linkedin": "https://linkedin.com/company/cloudscale-systems",
        "description": "Next-gen multi-cloud infrastructure and DevOps automation consultancy for scale-ups and fortune 500 enterprises.",
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "id": "comp-demo-3",
        "userId": "demo-company-3",
        "companyName": "CyberShield Defense",
        "officialEmail": "talent@cybershield.sec",
        "phoneNumber": "+91 99887 76655",
        "companyType": "Public",
        "companySize": "501-1000",
        "foundedYear": 2015,
        "website": "https://cybershield.sec",
        "linkedin": "https://linkedin.com/company/cybershield-defense",
        "description": "Cybersecurity engineering, threat intelligence, and zero-trust framework solutions for government and financial institutions.",
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "id": "comp-demo-4",
        "userId": "demo-company-4",
        "companyName": "DataPulse Dynamics",
        "officialEmail": "hr@datapulse.ai",
        "phoneNumber": "+91 97654 32109",
        "companyType": "Startup",
        "companySize": "51-200",
        "foundedYear": 2021,
        "website": "https://datapulse.ai",
        "linkedin": "https://linkedin.com/company/datapulse-dynamics",
        "description": "Real-time streaming data analytics engine and machine learning platform powering automated decision systems.",
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "id": "comp-demo-5",
        "userId": "demo-company-5",
        "companyName": "AI Frontier Labs",
        "officialEmail": "jobs@aifrontierlabs.com",
        "phoneNumber": "+91 91234 56789",
        "companyType": "Startup",
        "companySize": "11-50",
        "foundedYear": 2023,
        "website": "https://aifrontierlabs.com",
        "linkedin": "https://linkedin.com/company/ai-frontier-labs",
        "description": "Cutting-edge GenAI laboratory building vertical domain LLMs and computer vision products for healthcare & autonomous robotics.",
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
]

def seed_demo_companies():
    if not init_db():
        logger.error("Failed to connect to database for seeding companies.")
        return

    db: Session = database.SessionLocal()
    try:
        count = 0
        for comp in DEMO_COMPANIES:
            uid = comp["userId"]
            existing = db.query(CompanyProfileModel).filter(CompanyProfileModel.uid == uid).first()
            if existing:
                existing.profile_data = comp
                existing.updated_at = datetime.datetime.now(datetime.timezone.utc)
            else:
                record = CompanyProfileModel(
                    uid=uid,
                    profile_data=comp,
                    updated_at=datetime.datetime.now(datetime.timezone.utc)
                )
                db.add(record)
            count += 1
        db.commit()
        logger.info(f"Successfully seeded {count} demo company profiles into PostgreSQL ('company_profiles' table).")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding demo companies: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_companies()
