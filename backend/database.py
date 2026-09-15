import os
import logging
import datetime
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Float, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlalchemy.orm import declarative_base, sessionmaker, Session

logger = logging.getLogger("skillbridge.database")

# Load .env from project root
root_env_path = Path(__file__).resolve().parent.parent / '.env'
if root_env_path.exists():
    load_dotenv(dotenv_path=root_env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/skillbridge_db")

# Fallback for SQLAlchemy dialect string if using postgres://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

Base = declarative_base()

class StudentProfileModel(Base):
    __tablename__ = "student_profiles"

    uid = Column(String(128), primary_key=True, index=True)
    profile_data = Column(JSONB, nullable=False)
    is_demo = Column(Boolean, default=False, nullable=False, server_default="false")
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.now, onupdate=datetime.datetime.now)

class CompanyProfileModel(Base):
    __tablename__ = "company_profiles"

    uid = Column(String(128), primary_key=True, index=True)
    profile_data = Column(JSONB, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.now, onupdate=datetime.datetime.now)

class PlacementRecordModel(Base):
    __tablename__ = "placement_records"

    id = Column(String(128), primary_key=True, index=True)
    college_uid = Column(String(128), nullable=False, index=True)
    student_uid = Column(String(128), nullable=False, index=True)
    student_name = Column(String(256))
    department = Column(String(128))
    company_name = Column(String(256))
    role_title = Column(String(256))
    package_lpa = Column(Float)
    offer_date = Column(String(64))
    status = Column(String(64), default="ACCEPTED")
    is_demo = Column(Boolean, default=False, nullable=False, server_default="false")
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.now, onupdate=datetime.datetime.now)

class CollegeProfileModel(Base):
    __tablename__ = "college_profiles"

    uid = Column(String(128), primary_key=True, index=True)
    profile_data = Column(JSONB, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.now, onupdate=datetime.datetime.now)

class InterviewRequestModel(Base):
    __tablename__ = "interview_requests"

    id = Column(String(128), primary_key=True, index=True)
    company_uid = Column(String(128), nullable=False, index=True)
    company_name = Column(String(256), nullable=False)
    company_email = Column(String(256))
    student_uid = Column(String(128), nullable=False, index=True)
    opportunity_id = Column(String(128))
    opportunity_title = Column(String(256), nullable=False)
    opportunity_type = Column(String(32), nullable=False)
    interview_type = Column(String(64), nullable=False)
    proposed_date = Column(String(64), nullable=False)
    proposed_time = Column(String(64), nullable=False)
    mode = Column(String(32), nullable=False)
    meeting_link = Column(String(512))
    message = Column(String(2048))
    status = Column(String(32), nullable=False, default="PENDING")
    is_demo = Column(Boolean, default=False, nullable=False, server_default="false")
    batch_name = Column(String(256), nullable=True)
    feedback = Column(String(2048), nullable=True)
    rating = Column(String(64), nullable=True)
    skill_match = Column(String(64), nullable=True)
    assessment_score = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.now, onupdate=datetime.datetime.now)

# Global engine and SessionLocal
engine = None
SessionLocal = None
db_initialized = False
db_init_error = None

def init_db():
    global engine, SessionLocal, db_initialized, db_init_error
    try:
        # First ensure skillbridge_db database exists on PostgreSQL server
        try:
            # Parse connection details to connect to default postgres db first
            base_url = DATABASE_URL.rsplit('/', 1)[0] + '/postgres'
            temp_engine = create_engine(base_url, isolation_level="AUTOCOMMIT")
            with temp_engine.connect() as conn:
                check_sql = text("SELECT 1 FROM pg_database WHERE datname = 'skillbridge_db'")
                result = conn.execute(check_sql).fetchone()
                if not result:
                    logger.info("Database 'skillbridge_db' does not exist. Creating...")
                    conn.execute(text("CREATE DATABASE skillbridge_db"))
                    logger.info("Database 'skillbridge_db' created successfully.")
            temp_engine.dispose()
        except Exception as e:
            logger.warning(f"Could not auto-create database (may already exist or insufficient privileges): {e}")

        engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        # Create tables
        Base.metadata.create_all(bind=engine)

        # Safely migrate schema: ensure is_demo & batch columns exist without altering real data
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE interview_requests ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE interview_requests ADD COLUMN IF NOT EXISTS batch_name VARCHAR(256);"))
            conn.execute(text("ALTER TABLE interview_requests ADD COLUMN IF NOT EXISTS feedback VARCHAR(2048);"))
            conn.execute(text("ALTER TABLE interview_requests ADD COLUMN IF NOT EXISTS rating VARCHAR(64);"))
            conn.execute(text("ALTER TABLE interview_requests ADD COLUMN IF NOT EXISTS skill_match VARCHAR(64);"))
            conn.execute(text("ALTER TABLE interview_requests ADD COLUMN IF NOT EXISTS assessment_score VARCHAR(64);"))
            conn.execute(text("ALTER TABLE placement_records ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;"))
            conn.commit()

        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db_initialized = True
        db_init_error = None
        logger.info(f"Successfully connected to PostgreSQL at {DATABASE_URL}")
        return True
    except Exception as err:
        db_initialized = False
        db_init_error = str(err)
        logger.error(f"PostgreSQL Connection Error: {err}")
        return False

def get_db():
    if not db_initialized or SessionLocal is None:
        init_db()
    if not db_initialized:
        raise RuntimeError(f"Database connection unavailable: {db_init_error}")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
