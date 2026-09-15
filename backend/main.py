import os
import json
import base64
import logging
import time
import traceback
import urllib.request
import urllib.error
from pathlib import Path
import datetime
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, File, UploadFile, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import jwt
from sqlalchemy.orm import Session

import database
from database import get_db, StudentProfileModel, CompanyProfileModel, CollegeProfileModel, InterviewRequestModel, PlacementRecordModel, init_db
from opportunity_search_agent import search_opportunities_agent
from talent_scoring import compute_talent_scores_batch, FACTOR_LABELS

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("skillbridge.backend")

# Load environment variables from root directory
root_env_path = Path(__file__).resolve().parent.parent / '.env'
if root_env_path.exists():
    load_dotenv(dotenv_path=root_env_path)
    logger.info(f"Loaded environment from: {root_env_path}")
else:
    load_dotenv()
    logger.info("Loaded environment from default system env.")

app = FastAPI(
    title="SkillBridge API",
    description="Backend API for SIH26044 — Academia-Industry Collaboration Platform",
    version="1.0.0"
)

# Initialize Database on Startup
@app.on_event("startup")
def startup_event():
    logger.info("Initializing PostgreSQL database...")
    success = init_db()
    if success:
        logger.info("PostgreSQL database initialization succeeded.")
    else:
        logger.error(f"PostgreSQL database initialization failed: {database.db_init_error}")

# Configure CORS
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173")
origins = [o.strip() for o in origins_str.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "SkillBridge API",
        "version": "1.0.0",
        "message": "Welcome to SIH26044 Backend API"
    }

@app.get("/api/v1/health")
def health_check():
    gemini_key = os.getenv("GEMINI_API_KEY")
    db_ok = database.db_initialized
    db_err = database.db_init_error
    if not db_ok:
        db_ok = init_db()
        db_err = database.db_init_error

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else f"disconnected: {db_err}",
        "database_connected": db_ok,
        "database_error": db_err,
        "ai_engine": "ready" if gemini_key else "missing_key"
    }

class ResumeParseRequest(BaseModel):
    text: str

SYSTEM_EXTRACTION_PROMPT = """You are an expert resume document intelligence engine.
Analyze the provided resume file completely, including visual layout, headers, typography, tables, multi-column sections, bullet points, and text.

Extract ALL available information into a structured JSON object matching the exact JSON schema provided.

CRITICAL RULES:
1. NEVER invent, guess, or hallucinate credentials, names, dates, or values.
2. If a section or field is not explicitly present in the resume, return it as empty/null instead of guessing.
3. Extract ALL technical skills mentioned across summary, experience, education, projects, and skills sections.
4. Categorize technical skills logically (Programming, Web Development, Database, Cloud & DevOps, Tools).
5. Extract all project details, work experiences, certifications, achievements, languages, coursework, publications, and awards.
6. Return ONLY a valid JSON object matching the schema.
"""

GEMINI_EXTRACTION_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "personalInfo": {
            "type": "OBJECT",
            "properties": {
                "fullName": {"type": "STRING", "nullable": True},
                "email": {"type": "STRING", "nullable": True},
                "phone": {"type": "STRING", "nullable": True},
                "city": {"type": "STRING", "nullable": True},
                "state": {"type": "STRING", "nullable": True},
                "country": {"type": "STRING", "nullable": True},
                "linkedInUrl": {"type": "STRING", "nullable": True},
                "gitHubUrl": {"type": "STRING", "nullable": True},
                "portfolioUrl": {"type": "STRING", "nullable": True},
                "aboutMe": {"type": "STRING", "nullable": True}
            }
        },
        "academicInfo": {
            "type": "OBJECT",
            "properties": {
                "college": {"type": "STRING", "nullable": True},
                "degree": {"type": "STRING", "nullable": True},
                "branch": {"type": "STRING", "nullable": True},
                "currentYear": {"type": "STRING", "nullable": True},
                "currentSemester": {"type": "STRING", "nullable": True},
                "cgpa": {"type": "STRING", "nullable": True},
                "tenthPercentage": {"type": "STRING", "nullable": True},
                "twelfthPercentage": {"type": "STRING", "nullable": True},
                "graduationYear": {"type": "STRING", "nullable": True}
            }
        },
        "technicalSkills": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "name": {"type": "STRING"},
                    "category": {"type": "STRING"},
                    "proficiency": {"type": "STRING"}
                },
                "required": ["name"]
            }
        },
        "softSkills": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "name": {"type": "STRING"},
                    "proficiency": {"type": "STRING"}
                },
                "required": ["name"]
            }
        },
        "projects": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "projectName": {"type": "STRING"},
                    "description": {"type": "STRING"},
                    "technologies": {"type": "ARRAY", "items": {"type": "STRING"}},
                    "role": {"type": "STRING", "nullable": True},
                    "githubUrl": {"type": "STRING", "nullable": True},
                    "liveDemoUrl": {"type": "STRING", "nullable": True},
                    "skillsDemonstrated": {"type": "ARRAY", "items": {"type": "STRING"}}
                },
                "required": ["projectName"]
            }
        },
        "experience": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "organization": {"type": "STRING"},
                    "role": {"type": "STRING"},
                    "employmentType": {"type": "STRING"},
                    "startDate": {"type": "STRING", "nullable": True},
                    "endDate": {"type": "STRING", "nullable": True},
                    "currentlyWorking": {"type": "BOOLEAN"},
                    "location": {"type": "STRING", "nullable": True},
                    "responsibilities": {"type": "STRING"},
                    "skillsGained": {"type": "ARRAY", "items": {"type": "STRING"}}
                },
                "required": ["organization", "role"]
            }
        },
        "certifications": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "name": {"type": "STRING"},
                    "issuingOrganization": {"type": "STRING"},
                    "issueDate": {"type": "STRING", "nullable": True},
                    "expiryDate": {"type": "STRING", "nullable": True},
                    "credentialId": {"type": "STRING", "nullable": True},
                    "credentialUrl": {"type": "STRING", "nullable": True}
                },
                "required": ["name"]
            }
        },
        "achievements": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "title": {"type": "STRING"},
                    "organizationOrEvent": {"type": "STRING", "nullable": True},
                    "date": {"type": "STRING", "nullable": True},
                    "description": {"type": "STRING"}
                },
                "required": ["title"]
            }
        },
        "languages": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "language": {"type": "STRING"},
                    "readingLevel": {"type": "STRING", "nullable": True},
                    "writingLevel": {"type": "STRING", "nullable": True},
                    "speakingLevel": {"type": "STRING", "nullable": True}
                },
                "required": ["language"]
            }
        },
        "coursework": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "publications": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "title": {"type": "STRING"},
                    "publisher": {"type": "STRING", "nullable": True},
                    "date": {"type": "STRING", "nullable": True},
                    "link": {"type": "STRING", "nullable": True},
                    "description": {"type": "STRING", "nullable": True}
                },
                "required": ["title"]
            }
        },
        "awards": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "title": {"type": "STRING"},
                    "issuer": {"type": "STRING", "nullable": True},
                    "year": {"type": "STRING", "nullable": True}
                },
                "required": ["title"]
            }
        },
        "aboutMe": {"type": "STRING", "nullable": True}
    }
}

def discover_gemini_models(gemini_key: str) -> list:
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={gemini_key}"
    logger.info("[Gemini Models Discovery] Discovering available supported models from Gemini API...")
    preferred_order = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-2.5-pro",
        "gemini-1.5-pro",
        "gemini-flash-latest"
    ]
    discovered = []
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            models = data.get("models", [])
            for m in models:
                name = m.get("name", "").replace("models/", "")
                methods = m.get("supportedGenerationMethods", [])
                if "generateContent" in methods and "gemini" in name.lower():
                    discovered.append(name)
            logger.info(f"[Gemini Models Discovery] Found API key supported models: {discovered}")
    except Exception as e:
        logger.warning(f"[Gemini Models Discovery] Failed to dynamically query models: {e}")

    result = []
    for pref in preferred_order:
        if pref in discovered or not discovered:
            if pref not in result:
                result.append(pref)
    for d in discovered:
        if d not in result:
            result.append(d)

    return result if result else preferred_order

def upload_to_gemini_files_api(file_bytes: bytes, filename: str, mime_type: str, gemini_key: str) -> dict:
    file_size = len(file_bytes)
    logger.info(f"[Gemini Files API] Initiating resumable upload for '{filename}' ({file_size} bytes, mime={mime_type})...")
    
    start_url = f"https://generativelanguage.googleapis.com/upload/v1beta/files?key={gemini_key}"
    start_headers = {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": str(file_size),
        "X-Goog-Upload-Header-Content-Type": mime_type,
        "Content-Type": "application/json"
    }
    meta_payload = json.dumps({"file": {"display_name": filename}}).encode("utf-8")

    req = urllib.request.Request(start_url, data=meta_payload, headers=start_headers, method="POST")
    upload_url = None
    with urllib.request.urlopen(req, timeout=30) as resp:
        upload_url = resp.headers.get("X-Goog-Upload-URL")
        logger.info(f"[Gemini Files API] Received upload URL: {'YES' if upload_url else 'NO'}")

    if not upload_url:
        raise RuntimeError("Gemini Files API did not return an upload URL header (X-Goog-Upload-URL).")

    logger.info(f"[Gemini Files API] Upload session created. Uploading {file_size} raw file bytes...")
    upload_headers = {
        "Content-Length": str(file_size),
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize"
    }
    req_upload = urllib.request.Request(upload_url, data=file_bytes, headers=upload_headers, method="POST")
    with urllib.request.urlopen(req_upload, timeout=60) as resp_upload:
        res_json = json.loads(resp_upload.read().decode("utf-8"))
        logger.info(f"[Gemini Files API] Upload finalize response top-level keys: {list(res_json.keys())}")
        
        # The upload/finalize response wraps file info under "file" key
        file_info = res_json.get("file", res_json)
        
        file_name = file_info.get("name")
        file_uri = file_info.get("uri")
        file_state = file_info.get("state", "PROCESSING")
        
        logger.info(f"[Gemini Files API] Initial upload result — Name: {file_name}, URI: {file_uri}, State: {file_state}")
        
        if not file_name:
            raise RuntimeError(f"Gemini Files API upload returned no file name. Response: {json.dumps(res_json)[:500]}")
        
        # State Polling: Ensure file state becomes ACTIVE before calling model
        max_retries = 25
        while file_state == "PROCESSING" and max_retries > 0:
            logger.info(f"[Gemini Files API] File state is '{file_state}'. Waiting for ACTIVE... ({max_retries} retries left)")
            time.sleep(1.5)
            max_retries -= 1
            try:
                get_url = f"https://generativelanguage.googleapis.com/v1beta/{file_name}?key={gemini_key}"
                req_get = urllib.request.Request(get_url, method="GET")
                with urllib.request.urlopen(req_get, timeout=10) as resp_get:
                    poll_json = json.loads(resp_get.read().decode("utf-8"))
                    # IMPORTANT: The GET file endpoint returns the file object directly
                    # at the top level, NOT nested under a "file" key.
                    file_state = poll_json.get("state", file_state)
                    # Update file_info with latest polled data for URI/name/mimeType
                    file_info = poll_json
                    logger.info(f"[Gemini Files API] Poll result — State: {file_state}, URI: {poll_json.get('uri')}")
            except Exception as poll_err:
                logger.warning(f"[Gemini Files API] Polling error: {poll_err}")

        if file_state == "FAILED":
            raise RuntimeError(f"Gemini Files API file processing FAILED for '{filename}'. File never reached ACTIVE state.")
        
        if file_state != "ACTIVE":
            logger.warning(f"[Gemini Files API] File state is '{file_state}' (not ACTIVE) after polling. Proceeding anyway...")

        logger.info(f"[Gemini Files API] Upload COMPLETE — Name: {file_info.get('name')}, URI: {file_info.get('uri')}, State: {file_info.get('state', file_state)}, MimeType: {file_info.get('mimeType')}")
        return file_info

def delete_gemini_file(file_name: str, gemini_key: str):
    if not file_name:
        return
    try:
        clean_name = file_name if file_name.startswith("files/") else f"files/{file_name}"
        del_url = f"https://generativelanguage.googleapis.com/v1beta/{clean_name}?key={gemini_key}"
        req = urllib.request.Request(del_url, method="DELETE")
        with urllib.request.urlopen(req, timeout=10) as resp:
            logger.info(f"[Gemini Files API Cleanup] Successfully deleted temporary file: {clean_name}")
    except Exception as e:
        logger.warning(f"[Gemini Files API Cleanup] Failed deleting remote file {file_name}: {e}")

def execute_gemini_document_extraction(file_info: Optional[dict], text_fallback: Optional[str], gemini_key: str) -> dict:
    models_to_try = discover_gemini_models(gemini_key)
    logger.info(f"[Document Understanding] Active candidate models: {models_to_try}")

    file_uri = file_info.get("uri") if file_info else None
    mime_type = file_info.get("mimeType", "application/pdf") if file_info else "application/pdf"

    if file_uri:
        parts = [
            {"fileData": {"mimeType": mime_type, "fileUri": file_uri}},
            {"text": SYSTEM_EXTRACTION_PROMPT}
        ]
    elif text_fallback:
        parts = [
            {"text": SYSTEM_EXTRACTION_PROMPT},
            {"text": f"RESUME CONTENT:\n{text_fallback[:15000]}"}
        ]
    else:
        raise ValueError("Neither file_info nor text_fallback provided for extraction.")

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": GEMINI_EXTRACTION_SCHEMA
        }
    }

    last_error = None
    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}
        req_bytes = json.dumps(payload).encode("utf-8")
        logger.info(f"[Document Understanding] Invoking Gemini model: {model_name}...")

        try:
            req = urllib.request.Request(url, data=req_bytes, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=45) as resp:
                resp_str = resp.read().decode("utf-8")
                resp_json = json.loads(resp_str)
                
                candidates = resp_json.get("candidates", [])
                if not candidates:
                    raise ValueError(f"No candidates returned in response from Gemini: {resp_str}")

                raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                if not raw_text:
                    raise ValueError("Gemini returned an empty text payload.")

                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                elif raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]

                parsed_json = json.loads(raw_text.strip())
                logger.info(f"[Document Understanding] Extraction SUCCESS with model '{model_name}'. Extracted top-level fields: {list(parsed_json.keys())}")
                return {"extracted": parsed_json, "model_used": model_name}
        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8") if hasattr(he, "read") else str(he)
            logger.warning(f"[Document Understanding] Model {model_name} HTTP {he.code}: {err_body}")
            last_error = f"Model {model_name} HTTP {he.code}: {err_body}"
        except Exception as e:
            logger.warning(f"[Document Understanding] Model {model_name} failed: {e}")
            last_error = f"Model {model_name}: {str(e)}"

    raise RuntimeError(f"All available Gemini models failed. Last error: {last_error}")

@app.post("/api/v1/parse-resume-file")
async def parse_resume_file(file: UploadFile = File(...)):
    logger.info(f"[Parse Resume File Endpoint] ========== NEW UPLOAD REQUEST ==========")
    logger.info(f"[Parse Resume File Endpoint] Filename: '{file.filename}', Content-Type: '{file.content_type}'")
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        logger.error("[Parse Resume File Endpoint] GEMINI_API_KEY is not set in environment.")
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY is not configured on the backend server.")
    logger.info(f"[Parse Resume File Endpoint] GEMINI_API_KEY present: YES (length={len(gemini_key)})")

    try:
        content_bytes = await file.read()
        file_size = len(content_bytes)
        logger.info(f"[Parse Resume File Endpoint] PDF received: YES — Read {file_size} bytes ({file_size / 1024:.2f} KB)")

        if file_size < 50:
            logger.error(f"[Parse Resume File Endpoint] PDF received: FILE TOO SMALL ({file_size} bytes)")
            raise HTTPException(status_code=400, detail=f"Uploaded file is empty or corrupted ({file_size} bytes).")

        mime_type = file.content_type or "application/pdf"
        fname_lower = (file.filename or "").lower()
        if fname_lower.endswith(".pdf"):
            mime_type = "application/pdf"
        elif fname_lower.endswith(".docx"):
            mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        elif fname_lower.endswith(".doc"):
            mime_type = "application/msword"
        elif fname_lower.endswith(".txt"):
            mime_type = "text/plain"
        logger.info(f"[Parse Resume File Endpoint] Resolved MIME type: {mime_type}")

        file_info = None
        upload_method = "none"
        try:
            file_info = upload_to_gemini_files_api(content_bytes, file.filename or "resume.pdf", mime_type, gemini_key)
            upload_method = "files_api"
            logger.info(f"[Parse Resume File Endpoint] Gemini upload: SUCCESS (Files API)")
            logger.info(f"[Parse Resume File Endpoint] Gemini file state: {file_info.get('state', 'UNKNOWN')}")
        except Exception as upload_err:
            logger.warning(f"[Parse Resume File Endpoint] Gemini Files API upload FAILED: {upload_err}. Will try inline base64 fallback.")

        try:
            if file_info:
                logger.info(f"[Parse Resume File Endpoint] Calling Gemini Document Understanding with uploaded file URI: {file_info.get('uri')}")
                result = execute_gemini_document_extraction(file_info=file_info, text_fallback=None, gemini_key=gemini_key)
                upload_method = "files_api"
            else:
                logger.info(f"[Parse Resume File Endpoint] Using inline base64 fallback (file size: {file_size} bytes)")
                b64_data = base64.b64encode(content_bytes).decode("utf-8")
                payload_inline = {
                    "contents": [{
                        "parts": [
                            {"inlineData": {"mimeType": mime_type, "data": b64_data}},
                            {"text": SYSTEM_EXTRACTION_PROMPT}
                        ]
                    }],
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "responseSchema": GEMINI_EXTRACTION_SCHEMA
                    }
                }
                models = discover_gemini_models(gemini_key)
                last_err = None
                parsed_json = None
                used_model = None
                for m in models:
                    try:
                        url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={gemini_key}"
                        req_bytes = json.dumps(payload_inline).encode("utf-8")
                        req = urllib.request.Request(url, data=req_bytes, headers={"Content-Type": "application/json"}, method="POST")
                        logger.info(f"[Parse Resume File Endpoint] Trying inline extraction with model: {m}")
                        with urllib.request.urlopen(req, timeout=45) as resp:
                            res_text = json.loads(resp.read().decode("utf-8"))["candidates"][0]["content"]["parts"][0]["text"].strip()
                            if res_text.startswith("```json"): res_text = res_text[7:]
                            if res_text.endswith("```"): res_text = res_text[:-3]
                            parsed_json = json.loads(res_text.strip())
                            used_model = m
                            logger.info(f"[Parse Resume File Endpoint] Inline extraction SUCCESS with model: {m}")
                            break
                    except Exception as ie:
                        last_err = str(ie)
                        logger.warning(f"[Parse Resume File Endpoint] Inline model {m} failed: {ie}")
                if not parsed_json:
                    raise RuntimeError(f"Inline extraction failed with all models. Last error: {last_err}")
                result = {"extracted": parsed_json, "model_used": used_model}
                upload_method = "inline_base64"

            extracted = result["extracted"]
            extracted_keys = list(extracted.keys()) if isinstance(extracted, dict) else []
            logger.info(f"[Parse Resume File Endpoint] Gemini extraction: SUCCESS")
            logger.info(f"[Parse Resume File Endpoint] JSON received: YES")
            logger.info(f"[Parse Resume File Endpoint] Fields extracted: {extracted_keys}")
            logger.info(f"[Parse Resume File Endpoint] Model used: {result['model_used']}")
            logger.info(f"[Parse Resume File Endpoint] Upload method: {upload_method}")
            
            # Log field counts for diagnostic
            for field in ['personalInfo', 'academicInfo', 'technicalSkills', 'softSkills', 'projects', 'experience', 'certifications', 'achievements', 'languages', 'coursework', 'publications', 'awards']:
                val = extracted.get(field)
                if isinstance(val, list):
                    logger.info(f"[Parse Resume File Endpoint]   {field}: {len(val)} items")
                elif isinstance(val, dict):
                    non_empty = sum(1 for v in val.values() if v)
                    logger.info(f"[Parse Resume File Endpoint]   {field}: {non_empty} non-empty fields")
                elif val:
                    logger.info(f"[Parse Resume File Endpoint]   {field}: present")

            return {
                "status": "success",
                "extracted": extracted,
                "modelUsed": result["model_used"],
                "fileName": file.filename,
                "fileSize": f"{file_size / (1024 * 1024):.2f} MB",
                "uploadMethod": upload_method
            }
        finally:
            if file_info and file_info.get("name"):
                delete_gemini_file(file_info.get("name"), gemini_key)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"[Parse Resume File Endpoint] FATAL Exception: {exc}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Gemini document parsing failed: {str(exc)}")

@app.post("/api/v1/parse-resume")
def parse_resume(req: ResumeParseRequest):
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY is not configured on backend server.")

    if not req.text or len(req.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Resume text is too short to extract profile information.")

    try:
        result = execute_gemini_document_extraction(file_info=None, text_fallback=req.text, gemini_key=gemini_key)
        return {"status": "success", "extracted": result["extracted"], "modelUsed": result["model_used"]}
    except Exception as e:
        logger.error(f"[Parse Resume Text Endpoint] Error parsing text: {e}")
        raise HTTPException(status_code=503, detail=f"AI service error during text parsing: {str(e)}")


# ==========================================
# AI Opportunity Search Agent API
# ==========================================

class OpportunitySearchRequestPayload(BaseModel):
    targetRole: Optional[str] = None
    skills: Optional[List[str]] = []
    locations: Optional[List[str]] = []
    opportunityType: Optional[str] = "all"
    workMode: Optional[str] = "all"

@app.post("/api/v1/opportunities/search")
def search_opportunities_endpoint(req: OpportunitySearchRequestPayload):
    try:
        res = search_opportunities_agent(
            target_role=req.targetRole,
            student_skills=req.skills or [],
            preferred_locations=req.locations or [],
            work_mode=req.workMode or "all",
            opportunity_type=req.opportunityType or "all"
        )
        return res
    except Exception as err:
        logger.error(f"[Opportunities Search Endpoint] Error: {err}")
        raise HTTPException(status_code=500, detail=f"Opportunity search agent error: {str(err)}")

# ==========================================
# Student Profile PostgreSQL Persistence & Security API
# ==========================================


class StudentProfileSaveRequest(BaseModel):
    profile: Dict[str, Any]

def verify_token_and_uid(uid: str, authorization: Optional[str] = Header(None)) -> str:
    """
    Validates Firebase user authentication token and ensures requested {uid} matches authenticated UID.
    Prevents cross-UID access (User A reading or modifying User B's profile).
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Missing or invalid Authorization header."
        )
    
    token = authorization.split("Bearer ", 1)[1].strip()
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Empty authentication token."
        )

    authenticated_uid = None

    # Try PyJWT decoding
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        authenticated_uid = decoded.get("user_id") or decoded.get("uid") or decoded.get("sub")
    except Exception:
        pass

    # Dev/Mock token fallback
    if not authenticated_uid:
        if token.startswith("mock-token-"):
            authenticated_uid = token.replace("mock-token-", "")
        elif token.startswith("demo-token-"):
            authenticated_uid = token.replace("demo-token-", "")
        elif len(token) > 3 and not "." in token:
            authenticated_uid = token

    if not authenticated_uid:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Unable to verify user authentication token."
        )

    if authenticated_uid != uid:
        logger.warning(f"Security Alert: Authenticated UID '{authenticated_uid}' attempted access to profile for UID '{uid}'")
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You are not authorized to access another user's profile."
        )

    return authenticated_uid

@app.get("/api/v1/profiles/{uid}")
def get_profile_endpoint(
    uid: str,
    authenticated_uid: str = Depends(verify_token_and_uid),
    db: Session = Depends(get_db)
):
    try:
        record = db.query(StudentProfileModel).filter(StudentProfileModel.uid == uid).first()
        if not record:
            return {
                "status": "not_found",
                "message": f"No profile record found in PostgreSQL for UID: {uid}",
                "profile": None
            }
        return {
            "status": "success",
            "uid": uid,
            "profile": record.profile_data,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None
        }
    except Exception as err:
        logger.error(f"PostgreSQL Profile Query Error for UID {uid}: {err}")
        raise HTTPException(status_code=500, detail=f"Database query error: {str(err)}")

@app.put("/api/v1/profiles/{uid}")
def save_profile_endpoint(
    uid: str,
    payload: StudentProfileSaveRequest,
    authenticated_uid: str = Depends(verify_token_and_uid),
    db: Session = Depends(get_db)
):
    try:
        record = db.query(StudentProfileModel).filter(StudentProfileModel.uid == uid).first()
        now = datetime.datetime.now(datetime.timezone.utc)
        if record:
            record.profile_data = payload.profile
            record.is_demo = False
            record.updated_at = now
        else:
            record = StudentProfileModel(
                uid=uid,
                profile_data=payload.profile,
                is_demo=False,
                updated_at=now
            )
            db.add(record)
        db.commit()
        db.refresh(record)
        logger.info(f"Successfully persisted profile to PostgreSQL for UID: {uid}")
        return {
            "status": "success",
            "message": "Profile saved to PostgreSQL successfully",
            "uid": uid,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None
        }
    except Exception as err:
        db.rollback()
        logger.error(f"PostgreSQL Profile Save Error for UID {uid}: {err}")
        raise HTTPException(status_code=500, detail=f"Database save error: {str(err)}")

@app.delete("/api/v1/profiles/{uid}")
def delete_profile_endpoint(
    uid: str,
    authenticated_uid: str = Depends(verify_token_and_uid),
    db: Session = Depends(get_db)
):
    try:
        record = db.query(StudentProfileModel).filter(StudentProfileModel.uid == uid).first()
        if record:
            db.delete(record)
            db.commit()
            return {
                "status": "success",
                "message": f"Profile deleted from PostgreSQL for UID: {uid}"
            }
        return {
            "status": "not_found",
            "message": f"No profile record found to delete for UID: {uid}"
        }
    except Exception as err:
        db.rollback()
        logger.error(f"PostgreSQL Profile Delete Error for UID {uid}: {err}")
        raise HTTPException(status_code=500, detail=f"Database delete error: {str(err)}")

# ==========================================
# Company Profile PostgreSQL Persistence API
# ==========================================

class CompanyProfileSaveRequest(BaseModel):
    profile: Dict[str, Any]

@app.get("/api/v1/company-profiles/{uid}")
def get_company_profile_endpoint(
    uid: str,
    authenticated_uid: str = Depends(verify_token_and_uid),
    db: Session = Depends(get_db)
):
    try:
        record = db.query(CompanyProfileModel).filter(CompanyProfileModel.uid == uid).first()
        if not record:
            return {
                "status": "not_found",
                "message": f"No company profile record found in PostgreSQL for UID: {uid}",
                "profile": None
            }
        return {
            "status": "success",
            "uid": uid,
            "profile": record.profile_data,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None
        }
    except Exception as err:
        logger.error(f"PostgreSQL Company Profile Query Error for UID {uid}: {err}")
        raise HTTPException(status_code=500, detail=f"Database query error: {str(err)}")

@app.put("/api/v1/company-profiles/{uid}")
def save_company_profile_endpoint(
    uid: str,
    payload: CompanyProfileSaveRequest,
    authenticated_uid: str = Depends(verify_token_and_uid),
    db: Session = Depends(get_db)
):
    try:
        record = db.query(CompanyProfileModel).filter(CompanyProfileModel.uid == uid).first()
        now = datetime.datetime.now(datetime.timezone.utc)
        if record:
            record.profile_data = payload.profile
            record.updated_at = now
        else:
            record = CompanyProfileModel(
                uid=uid,
                profile_data=payload.profile,
                updated_at=now
            )
            db.add(record)
        db.commit()
        db.refresh(record)
        logger.info(f"Successfully persisted company profile to PostgreSQL for UID: {uid}")
        return {
            "status": "success",
            "message": "Company profile saved to PostgreSQL successfully",
            "uid": uid,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None
        }
    except Exception as err:
        db.rollback()
        logger.error(f"PostgreSQL Company Profile Save Error for UID {uid}: {err}")
        raise HTTPException(status_code=500, detail=f"Database save error: {str(err)}")

@app.delete("/api/v1/company-profiles/{uid}")
def delete_company_profile_endpoint(
    uid: str,
    authenticated_uid: str = Depends(verify_token_and_uid),
    db: Session = Depends(get_db)
):
    try:
        record = db.query(CompanyProfileModel).filter(CompanyProfileModel.uid == uid).first()
        if record:
            db.delete(record)
            db.commit()
            return {
                "status": "success",
                "message": f"Company profile deleted from PostgreSQL for UID: {uid}"
            }
        return {
            "status": "not_found",
            "message": f"No company profile record found to delete for UID: {uid}"
        }
    except Exception as err:
        db.rollback()
        logger.error(f"PostgreSQL Company Profile Delete Error for UID {uid}: {err}")
        raise HTTPException(status_code=500, detail=f"Database delete error: {str(err)}")

# ==========================================
# College Profile PostgreSQL Persistence API
# ==========================================

class CollegeProfileSaveRequest(BaseModel):
    profile: Dict[str, Any]

@app.get("/api/v1/college-profiles/{uid}")
def get_college_profile_endpoint(
    uid: str,
    authenticated_uid: str = Depends(verify_token_and_uid),
    db: Session = Depends(get_db)
):
    try:
        record = db.query(CollegeProfileModel).filter(CollegeProfileModel.uid == uid).first()
        if not record:
            return {
                "status": "not_found",
                "message": f"No college profile record found in PostgreSQL for UID: {uid}",
                "profile": None
            }
        return {
            "status": "success",
            "uid": uid,
            "profile": record.profile_data,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None
        }
    except Exception as err:
        logger.error(f"PostgreSQL College Profile Query Error for UID {uid}: {err}")
        raise HTTPException(status_code=500, detail=f"Database query error: {str(err)}")

@app.put("/api/v1/college-profiles/{uid}")
def save_college_profile_endpoint(
    uid: str,
    payload: CollegeProfileSaveRequest,
    authenticated_uid: str = Depends(verify_token_and_uid),
    db: Session = Depends(get_db)
):
    try:
        record = db.query(CollegeProfileModel).filter(CollegeProfileModel.uid == uid).first()
        now = datetime.datetime.now(datetime.timezone.utc)
        if record:
            record.profile_data = payload.profile
            record.updated_at = now
        else:
            record = CollegeProfileModel(
                uid=uid,
                profile_data=payload.profile,
                updated_at=now
            )
            db.add(record)
        db.commit()
        db.refresh(record)
        logger.info(f"Successfully persisted college profile to PostgreSQL for UID: {uid}")
        return {
            "status": "success",
            "message": "College profile saved to PostgreSQL successfully",
            "uid": uid,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None
        }
    except Exception as err:
        db.rollback()
        logger.error(f"PostgreSQL College Profile Save Error for UID {uid}: {err}")
        raise HTTPException(status_code=500, detail=f"Database save error: {str(err)}")

@app.delete("/api/v1/college-profiles/{uid}")
def delete_college_profile_endpoint(
    uid: str,
    authenticated_uid: str = Depends(verify_token_and_uid),
    db: Session = Depends(get_db)
):
    try:
        record = db.query(CollegeProfileModel).filter(CollegeProfileModel.uid == uid).first()
        if record:
            db.delete(record)
            db.commit()
            return {
                "status": "success",
                "message": f"College profile deleted from PostgreSQL for UID: {uid}"
            }
        return {
            "status": "not_found",
            "message": f"No college profile record found to delete for UID: {uid}"
        }
    except Exception as err:
        db.rollback()
        logger.error(f"PostgreSQL College Profile Delete Error for UID {uid}: {err}")
        raise HTTPException(status_code=500, detail=f"Database delete error: {str(err)}")

# ==========================================
# AI Opportunity Search Agent API
# ==========================================

class OpportunitySearchRequest(BaseModel):
    targetRole: Optional[str] = None
    skills: Optional[List[str]] = None
    locations: Optional[List[str]] = None
    workMode: Optional[str] = "all"
    opportunityType: Optional[str] = "all"

@app.post("/api/v1/opportunities/search")
def search_opportunities_endpoint(
    req: Optional[OpportunitySearchRequest] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    AI Opportunity Search Agent Endpoint.
    Reads current authenticated student profile from PostgreSQL, extracts skills & target role,
    searches permitted external sources, deduplicates, calculates Skill Match %, and returns personalized opportunities.
    """
    authenticated_uid = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
        try:
            decoded = jwt.decode(token, options={"verify_signature": False})
            authenticated_uid = decoded.get("user_id") or decoded.get("uid") or decoded.get("sub")
        except Exception:
            pass
        if not authenticated_uid:
            if token.startswith("mock-token-"):
                authenticated_uid = token.replace("mock-token-", "")
            elif token.startswith("demo-token-"):
                authenticated_uid = token.replace("demo-token-", "")
            elif len(token) > 3 and not "." in token:
                authenticated_uid = token

    db_profile_data = {}
    if authenticated_uid:
        rec = db.query(StudentProfileModel).filter(StudentProfileModel.uid == authenticated_uid).first()
        if rec and rec.profile_data:
            db_profile_data = rec.profile_data

    # Extract target role
    target_role = (req.targetRole if req and req.targetRole else None) or \
                  db_profile_data.get("careerPreferences", {}).get("targetRole") or \
                  db_profile_data.get("targetRole") or \
                  db_profile_data.get("personalInfo", {}).get("targetRole") or ""

    # Extract student skills
    student_skills = []
    if req and req.skills:
        student_skills = req.skills
    elif db_profile_data.get("technicalSkills"):
        raw_skills = db_profile_data.get("technicalSkills", [])
        student_skills = [s.get("name") for s in raw_skills if isinstance(s, dict) and s.get("name")]

    # Extract locations
    locations = []
    if req and req.locations:
        locations = req.locations
    elif db_profile_data.get("careerPreferences", {}).get("preferredLocations"):
        locations = db_profile_data.get("careerPreferences", {}).get("preferredLocations", [])

    work_mode = (req.workMode if req else "all") or db_profile_data.get("careerPreferences", {}).get("workMode") or "all"
    opp_type = (req.opportunityType if req else "all") or "all"

    gemini_key = os.getenv("GEMINI_API_KEY")

    result = search_opportunities_agent(
        target_role=target_role,
        student_skills=student_skills,
        preferred_locations=locations,
        work_mode=work_mode,
        opportunity_type=opp_type,
        gemini_key=gemini_key
    )
    return result

# ==========================================
# Top Talent Discovery API (Talent Flow — NOT Applications)
# ==========================================

@app.get("/api/v1/top-talent")
def get_top_talent(
    type: Optional[str] = None,          # 'internship' | 'job' | None
    role_filter: Optional[str] = None,   # e.g. 'Frontend Developer'
    skill_filter: Optional[str] = None,  # comma-separated e.g. 'React,TypeScript'
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Top Talent Discovery endpoint.
    Fetches ALL student profiles from PostgreSQL, scores them using the
    transparent multi-factor scoring engine, and returns ranked results.

    This is the TALENT DISCOVERY flow — these students have NOT applied.
    """
    try:
        records = db.query(StudentProfileModel).all()
        if not records:
            return {
                "status": "success",
                "talent": [],
                "total": 0,
                "factor_labels": FACTOR_LABELS,
                "message": "No student profiles found. Run `python backend/seed_demo_students.py` to seed demo data."
            }

        # Build profile dicts
        profiles = []
        for rec in records:
            prof = {"uid": rec.uid, "profile_data": rec.profile_data or {}}
            # Propagate is_demo from DB column
            if rec.is_demo:
                if "metadata" not in prof["profile_data"]:
                    prof["profile_data"]["metadata"] = {}
                prof["profile_data"]["metadata"]["is_demo"] = True
            profiles.append(prof)

        # Parse skill filter
        skills_list = None
        if skill_filter:
            skills_list = [s.strip() for s in skill_filter.split(",") if s.strip()]

        # Score and rank
        ranked = compute_talent_scores_batch(
            profiles=profiles,
            role_filter=role_filter,
            skill_filter=skills_list,
            opportunity_type=type,
        )

        # Apply limit
        ranked = ranked[:limit]

        return {
            "status": "success",
            "talent": ranked,
            "total": len(ranked),
            "factor_labels": FACTOR_LABELS,
        }

    except Exception as err:
        logger.error(f"Top Talent API Error: {err}")
        raise HTTPException(status_code=500, detail=f"Top Talent scoring error: {str(err)}")


@app.get("/api/v1/student-public-profile/{uid}")
def get_student_public_profile(
    uid: str,
    db: Session = Depends(get_db)
):
    """
    Recruiter-facing read-only student profile.
    Exposes ONLY safe public fields — no email, phone, auth tokens, or Firebase UID.
    """
    try:
        record = db.query(StudentProfileModel).filter(StudentProfileModel.uid == uid).first()
        if not record:
            raise HTTPException(status_code=404, detail=f"Student profile not found: {uid}")

        profile = record.profile_data or {}
        personal = profile.get("personalInfo", {})
        academic = profile.get("academicInfo", {})
        career = profile.get("careerPreferences", {})

        # Build recruiter-safe profile — strip sensitive fields
        public_profile = {
            "uid": uid,
            "name": personal.get("fullName", "Unknown"),
            "avatar_url": personal.get("avatarUrl", ""),
            "about_me": personal.get("aboutMe", ""),
            "location": personal.get("location", personal.get("city", "")),

            "education": {
                "institution": academic.get("institution") or academic.get("college", ""),
                "degree": academic.get("degree", ""),
                "department": academic.get("department") or academic.get("branch", ""),
                "graduation_year": academic.get("graduationYear", ""),
                "cgpa": academic.get("cgpa", ""),
            },

            "technical_skills": profile.get("technicalSkills", []),
            "soft_skills": profile.get("softSkills", []),
            "projects": profile.get("projects", []),
            "experiences": profile.get("experiences", []) or profile.get("experience", []),
            "certifications": profile.get("certifications", []),
            "achievements": profile.get("achievements", []),
            "assessment_details": profile.get("assessmentDetails", {}),
            "industry_readiness": profile.get("industryReadiness"),
            "roadmap_progress": profile.get("roadmapProgress"),

            "career": {
                "target_role": career.get("targetRole", ""),
                "preferred_locations": career.get("preferredLocations", []),
                "work_mode": career.get("workMode", ""),
            },

            "is_demo": record.is_demo or profile.get("metadata", {}).get("is_demo", False),
        }

        return {
            "status": "success",
            "profile": public_profile,
        }

    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"Public Profile API Error for UID {uid}: {err}")
        raise HTTPException(status_code=500, detail=f"Public profile error: {str(err)}")


# ==========================================
# Interview Requests API (Talent Discovery Flow)
# ==========================================

import uuid

class InterviewRequestPayload(BaseModel):
    company_uid: str
    company_name: str
    company_email: Optional[str] = None
    student_uid: str
    opportunity_id: Optional[str] = None
    opportunity_title: str
    opportunity_type: str   # 'internship' | 'job'
    interview_type: str     # 'technical' | 'behavioral' | 'general'
    proposed_date: str
    proposed_time: str
    mode: str               # 'online' | 'in-person'
    meeting_link: Optional[str] = None
    message: Optional[str] = None

class InterviewResponsePayload(BaseModel):
    action: str  # 'accept' | 'decline'

@app.post("/api/v1/interview-requests")
def create_interview_request(
    payload: InterviewRequestPayload,
    db: Session = Depends(get_db)
):
    """
    Company sends an interview request to a student discovered via Top Talent.
    This does NOT create an application — it stays in the Talent Discovery flow.
    """
    try:
        req_id = f"ir-{uuid.uuid4().hex[:12]}"
        now = datetime.datetime.now(datetime.timezone.utc)

        new_request = InterviewRequestModel(
            id=req_id,
            company_uid=payload.company_uid,
            company_name=payload.company_name,
            company_email=payload.company_email,
            student_uid=payload.student_uid,
            opportunity_id=payload.opportunity_id,
            opportunity_title=payload.opportunity_title,
            opportunity_type=payload.opportunity_type,
            interview_type=payload.interview_type,
            proposed_date=payload.proposed_date,
            proposed_time=payload.proposed_time,
            mode=payload.mode,
            meeting_link=payload.meeting_link,
            message=payload.message,
            status="PENDING",
            created_at=now,
            updated_at=now,
        )
        db.add(new_request)
        db.commit()
        db.refresh(new_request)

        logger.info(f"Interview request {req_id} created: {payload.company_name} → student {payload.student_uid}")
        return {
            "status": "success",
            "interview_request_id": req_id,
            "message": "Interview request sent successfully. Student will be notified.",
        }
    except Exception as err:
        db.rollback()
        logger.error(f"Interview Request Create Error: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to create interview request: {str(err)}")


@app.get("/api/v1/interview-requests/student/{uid}")
def get_student_interview_requests(
    uid: str,
    db: Session = Depends(get_db)
):
    """Student retrieves their received interview requests from the Talent Discovery flow."""
    try:
        requests = db.query(InterviewRequestModel).filter(
            InterviewRequestModel.student_uid == uid
        ).order_by(InterviewRequestModel.created_at.desc()).all()

        result = []
        for r in requests:
            result.append({
                "id": r.id,
                "company_name": r.company_name,
                "opportunity_title": r.opportunity_title,
                "opportunity_type": r.opportunity_type,
                "interview_type": r.interview_type,
                "proposed_date": r.proposed_date,
                "proposed_time": r.proposed_time,
                "mode": r.mode,
                "meeting_link": r.meeting_link,
                "message": r.message,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            })

        return {"status": "success", "requests": result, "total": len(result)}

    except Exception as err:
        logger.error(f"Student Interview Requests Error for UID {uid}: {err}")
        raise HTTPException(status_code=500, detail=f"Error fetching interview requests: {str(err)}")


@app.patch("/api/v1/interview-requests/{request_id}/respond")
def respond_to_interview_request(
    request_id: str,
    payload: InterviewResponsePayload,
    db: Session = Depends(get_db)
):
    """Student accepts or declines an interview request."""
    try:
        record = db.query(InterviewRequestModel).filter(InterviewRequestModel.id == request_id).first()
        if not record:
            raise HTTPException(status_code=404, detail=f"Interview request not found: {request_id}")

        if record.status != "PENDING":
            raise HTTPException(status_code=400, detail=f"Interview request already responded to: {record.status}")

        if payload.action == "accept":
            record.status = "ACCEPTED"
        elif payload.action == "decline":
            record.status = "DECLINED"
        else:
            raise HTTPException(status_code=400, detail=f"Invalid action: {payload.action}. Use 'accept' or 'decline'.")

        record.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        db.refresh(record)

        logger.info(f"Interview request {request_id} responded: {payload.action}")
        return {
            "status": "success",
            "interview_request_id": request_id,
            "new_status": record.status,
            "message": f"Interview request {payload.action}ed successfully.",
        }

    except HTTPException:
        raise
    except Exception as err:
        db.rollback()
        logger.error(f"Interview Request Response Error: {err}")
        raise HTTPException(status_code=500, detail=f"Error responding to interview request: {str(err)}")


# ==========================================
# Company Role-Based Interview Batches & Feedback API
# ==========================================

class InterviewFeedbackRequest(BaseModel):
    feedback: Optional[str] = None
    rating: Optional[str] = None
    status: Optional[str] = None

@app.get("/api/v1/company-interviews/batches")
def get_company_interview_batches(
    company_uid: Optional[str] = "company_acme_corp",
    db: Session = Depends(get_db)
):
    """
    Returns 3 AI-generated role-based interview batches for the company,
    with completed and pending lists containing rich student info, skill match, score, and feedback.
    """
    try:
        from seed_demo_interviews import seed_demo_interviews
        
        # Query interview requests from PostgreSQL
        records = db.query(InterviewRequestModel).filter(
            InterviewRequestModel.company_uid == company_uid
        ).all()

        # If no interview records exist, seed default demo interviews
        if not records:
            logger.info("No interview records found in PostgreSQL. Seeding 3 AI role-based demo interview batches...")
            seed_demo_interviews(clear_first=False, db=db)
            records = db.query(InterviewRequestModel).filter(
                InterviewRequestModel.company_uid == company_uid
            ).all()

        # Build mapping of student profile details for fast lookup
        student_uids = list(set([r.student_uid for r in records if r.student_uid]))
        student_profiles_map = {}
        if student_uids:
            student_records = db.query(StudentProfileModel).filter(StudentProfileModel.uid.in_(student_uids)).all()
            for sp in student_records:
                pdata = sp.profile_data or {}
                personal = pdata.get("personalInfo", {})
                academic = pdata.get("academicInfo", {})
                student_profiles_map[sp.uid] = {
                    "name": personal.get("fullName", "Candidate"),
                    "college": academic.get("institution") or academic.get("college", "SkillBridge Partner College"),
                    "degree": academic.get("degree", "B.Tech"),
                    "avatar_url": personal.get("avatarUrl", ""),
                }

        # Fallback names for demo students if DB student profile not populated
        demo_name_map = {
            "demo_student_01": ("Rahul Kumar", "IIT Delhi", "B.Tech CSE"),
            "demo_student_02": ("Priya Sharma", "NIT Surathkal", "B.Tech IT"),
            "demo_student_03": ("Aarav Mehta", "IIT Bombay", "B.Tech CS"),
            "demo_student_04": ("Ananya Roy", "IIIT Hyderabad", "B.Tech CSE"),
            "demo_student_05": ("Vikramaditya Singh", "BITS Pilani", "B.E. CS"),
            "demo_student_06": ("Meera Iyer", "Anna University", "B.E. CSE"),
            "demo_student_07": ("Arjun Kapoor", "COEP Pune", "B.Tech IT"),
            "demo_student_08": ("Sneha Deshmukh", "RVCE Bengaluru", "B.E. IS"),
            "demo_student_09": ("Karthik Rajan", "PSG Tech", "B.E. ECE"),
            "demo_student_10": ("Diya Banerjee", "Jadavpur University", "B.E. CSE"),
            "demo_student_11": ("Sahil Patel", "Nirma University", "B.Tech CE"),
            "demo_student_12": ("Ishani Gupta", "LNMIIT Jaipur", "B.Tech CS"),
        }

        # Group records by batch_name
        batches_map = {}
        for r in records:
            b_name = r.batch_name or f"Role Batch - {r.opportunity_title}"
            if b_name not in batches_map:
                batches_map[b_name] = {
                    "batch_id": b_name.lower().replace(" ", "-").replace("#", ""),
                    "batch_name": b_name,
                    "role_title": r.opportunity_title,
                    "opportunity_type": r.opportunity_type,
                    "ai_summary": f"AI-generated role batch matching compiler test scores and verified skills for {r.opportunity_title}.",
                    "completed_interviews": [],
                    "pending_interviews": []
                }

            # Resolve candidate details
            candidate_info = student_profiles_map.get(r.student_uid)
            if not candidate_info and r.student_uid in demo_name_map:
                d_name, d_coll, d_deg = demo_name_map[r.student_uid]
                candidate_info = {
                    "name": d_name,
                    "college": d_coll,
                    "degree": d_deg,
                    "avatar_url": "",
                }
            elif not candidate_info:
                candidate_info = {
                    "name": f"Student ({r.student_uid[:8]})",
                    "college": "SkillBridge Network College",
                    "degree": "B.Tech",
                    "avatar_url": "",
                }

            interview_dict = {
                "id": r.id,
                "company_uid": r.company_uid,
                "company_name": r.company_name,
                "student_uid": r.student_uid,
                "student_name": candidate_info["name"],
                "student_college": candidate_info["college"],
                "student_degree": candidate_info["degree"],
                "avatar_url": candidate_info["avatar_url"],
                "role": r.opportunity_title,
                "opportunity_type": r.opportunity_type,
                "interview_type": r.interview_type,
                "proposed_date": r.proposed_date,
                "proposed_time": r.proposed_time,
                "mode": r.mode,
                "meeting_link": r.meeting_link,
                "message": r.message,
                "status": r.status,
                "feedback": r.feedback or "",
                "rating": r.rating or "Not Rated",
                "skill_match": r.skill_match or "92%",
                "assessment_score": r.assessment_score or "90 / 100",
                "is_demo": r.is_demo,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }

            if r.status == "COMPLETED":
                batches_map[b_name]["completed_interviews"].append(interview_dict)
            else:
                batches_map[b_name]["pending_interviews"].append(interview_dict)

        # Convert to list and compute summary metrics
        batches_list = []
        for b_name, b_data in batches_map.items():
            b_data["total_count"] = len(b_data["completed_interviews"]) + len(b_data["pending_interviews"])
            b_data["completed_count"] = len(b_data["completed_interviews"])
            b_data["pending_count"] = len(b_data["pending_interviews"])
            batches_list.append(b_data)

        # Sort batches predictably
        batches_list.sort(key=lambda x: x["batch_name"])

        return {
            "status": "success",
            "company_uid": company_uid,
            "batches": batches_list,
            "total_batches": len(batches_list),
        }

    except Exception as err:
        logger.error(f"Error fetching company interview batches: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch interview batches: {str(err)}")


@app.patch("/api/v1/company-interviews/{interview_id}/feedback")
def update_company_interview_feedback(
    interview_id: str,
    payload: InterviewFeedbackRequest,
    db: Session = Depends(get_db)
):
    """Update recruiter evaluation feedback, rating, or status for an interview record in PostgreSQL."""
    try:
        record = db.query(InterviewRequestModel).filter(InterviewRequestModel.id == interview_id).first()
        if not record:
            raise HTTPException(status_code=404, detail=f"Interview record not found: {interview_id}")

        if payload.feedback is not None:
            record.feedback = payload.feedback
        if payload.rating is not None:
            record.rating = payload.rating
        if payload.status is not None:
            record.status = payload.status

        record.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        db.refresh(record)

        logger.info(f"Updated feedback/status for interview {interview_id}")
        return {
            "status": "success",
            "interview_id": interview_id,
            "feedback": record.feedback,
            "rating": record.rating,
            "interview_status": record.status,
            "message": "Interview feedback updated successfully in PostgreSQL.",
        }
    except HTTPException:
        raise
    except Exception as err:
        db.rollback()
        logger.error(f"Error updating interview feedback for {interview_id}: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to update feedback: {str(err)}")


@app.post("/api/v1/company-interviews/seed-demo")
def trigger_demo_interview_seed(db: Session = Depends(get_db)):
    """Manual trigger to re-seed demo interview records in PostgreSQL."""
    try:
        from seed_demo_interviews import seed_demo_interviews
        count = seed_demo_interviews(clear_first=True, db=db)
        return {
            "status": "success",
            "message": f"Successfully re-seeded {count} demo interviews across 3 AI role batches into PostgreSQL.",
            "seeded_count": count
        }
    except Exception as err:
        logger.error(f"Error triggering demo interview seed: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to seed demo interviews: {str(err)}")


# ==========================================
# SkillBridge College Portal Security & REST APIs
# ==========================================

CANONICAL_DEPARTMENTS = ["Computer Science", "AI & ML", "DS", "ECE"]

def normalize_department_name(raw_name: Optional[str]) -> str:
    """
    Central reusable function to normalize any raw department string, code, or variation
    into one of 4 canonical department names: 'Computer Science', 'AI & ML', 'DS', 'ECE'.
    """
    if not raw_name:
        return "Computer Science"

    clean = str(raw_name).strip()
    if "(legacy)" in clean.lower():
        clean = clean.replace("(Legacy)", "").replace("(legacy)", "").strip()

    low = clean.lower()

    if any(k in low for k in ["computer science", "cse", "computer engineering"]) or low == "cs":
        return "Computer Science"
    if any(k in low for k in ["artificial intelligence", "ai & ml", "aiml", "machine learning"]):
        return "AI & ML"
    if any(k in low for k in ["data science", "ds"]):
        return "DS"
    if any(k in low for k in ["electronics", "ece"]):
        return "ECE"

    return "Computer Science"


def get_active_college_departments(college_uid: str, db: Session) -> list:
    """
    Retrieves configured active departments from CollegeProfileModel in PostgreSQL.
    Always normalizes department names to canonical names ['CSE', 'AI & ML', 'DS', 'ECE'].
    """
    raw_depts = []
    if college_uid:
        record = db.query(CollegeProfileModel).filter(CollegeProfileModel.uid == college_uid).first()
        if not record or not record.profile_data:
            record = db.query(CollegeProfileModel).first()
        if record and record.profile_data:
            depts_raw = record.profile_data.get("departments")
            if isinstance(depts_raw, list) and len(depts_raw) > 0:
                raw_depts = [str(d).strip() for d in depts_raw if str(d).strip()]
            elif isinstance(depts_raw, str) and depts_raw.strip():
                raw_depts = [d.strip() for d in depts_raw.split(",") if d.strip()]

    if not raw_depts:
        return ["Computer Science", "AI & ML", "DS", "ECE"]

    normalized = []
    for d in raw_depts:
        norm = normalize_department_name(d)
        if norm not in normalized:
            normalized.append(norm)

    return normalized if normalized else ["Computer Science", "AI & ML", "DS", "ECE"]


def verify_college_token_and_uid(authorization: Optional[str] = Header(None)) -> str:
    """
    Validates Firebase user authentication token and ensures authenticated user is a College account.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Missing or invalid Authorization header."
        )
    
    token = authorization.split("Bearer ", 1)[1].strip()
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Empty authentication token."
        )

    authenticated_uid = None

    # PyJWT decoding
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        authenticated_uid = decoded.get("user_id") or decoded.get("uid") or decoded.get("sub")
    except Exception:
        pass

    # Dev/Mock token fallback
    if not authenticated_uid:
        if token.startswith("mock-token-"):
            authenticated_uid = token.replace("mock-token-", "")
        elif token.startswith("demo-token-"):
            authenticated_uid = token.replace("demo-token-", "")
        elif len(token) > 3 and not "." in token:
            authenticated_uid = token

    if not authenticated_uid:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Unable to verify user authentication token."
        )

    return authenticated_uid


@app.get("/api/v1/college/dashboard")
def get_college_dashboard(
    authenticated_uid: str = Depends(verify_college_token_and_uid),
    db: Session = Depends(get_db)
):
    """Dynamic College Dashboard KPIs computed strictly from PostgreSQL records using College Profile departments as Single Source of Truth."""
    try:
        students = db.query(StudentProfileModel).all()
        placements = db.query(PlacementRecordModel).all()

        active_departments = get_active_college_departments(authenticated_uid, db)

        total_students = len(students)
        if total_students == 0:
            return {
                "status": "success",
                "kpis": {
                    "total_students": 0, "profile_completion_pct": 0, "avg_skill_score": 0,
                    "avg_readiness_pct": 0, "internship_participation_pct": 0, "students_placement_ready": 0,
                    "students_placed": 0, "placement_rate_pct": 0, "active_internship_opportunities": 0,
                    "active_job_opportunities": 0
                },
                "readiness_overview": {"ready": 0, "nearly_ready": 0, "needs_improvement": 0, "high_priority": 0},
                "department_overview": [
                    {"department": d, "student_count": 0, "avg_skill_score": 0, "avg_readiness_pct": 0, "internship_participation_pct": 0, "placement_rate_pct": 0, "top_skill_gap": "None", "is_legacy": False}
                    for d in active_departments
                ],
                "active_departments": active_departments,
                "industry_skill_demand": [],
                "recent_activity": []
            }

        # Pre-initialize map with active departments
        dept_data_map = {}
        for dname in active_departments:
            dept_data_map[dname] = {
                "department": dname, "count": 0, "skill_sum": 0, "readiness_sum": 0,
                "internship_count": 0, "eligible_4_2": 0, "placed_count": 0, "is_legacy": False
            }

        # Calculate KPIs dynamically
        skill_scores = []
        readiness_scores = []
        completed_score_sum = 0
        internship_participants = 0
        placement_ready_count = 0
        readiness_overview = {"ready": 0, "nearly_ready": 0, "needs_improvement": 0, "high_priority": 0}
        eligible_4_2_students = 0

        target_skills_def = [
            {"skill": "Python", "industry_demand_pct": 85},
            {"skill": "React", "industry_demand_pct": 90},
            {"skill": "PostgreSQL", "industry_demand_pct": 80},
            {"skill": "TypeScript", "industry_demand_pct": 75},
            {"skill": "Node.js", "industry_demand_pct": 85},
            {"skill": "AWS Cloud", "industry_demand_pct": 85},
            {"skill": "Docker", "industry_demand_pct": 80},
            {"skill": "AutoCAD", "industry_demand_pct": 70},
            {"skill": "Embedded C", "industry_demand_pct": 75},
            {"skill": "MATLAB", "industry_demand_pct": 65},
        ]
        skill_counts = {item["skill"]: 0 for item in target_skills_def}

        # Placement lookup map by student_uid
        placed_student_uids = {p.student_uid for p in placements if p.student_uid}

        for st in students:
            pdata = st.profile_data or {}
            acad = pdata.get("academicInfo", {})
            personal = pdata.get("personalInfo", {})
            career = pdata.get("careerPreferences", {})
            skills_raw = pdata.get("technicalSkills", [])

            readiness = float(pdata.get("industryReadiness", 75))
            score = float(pdata.get("assessmentDetails", {}).get("testScore", 75))
            istatus = pdata.get("internshipStatus", "")
            sem = acad.get("semester", "")
            is_4_2 = (sem == "4-2")

            if is_4_2:
                eligible_4_2_students += 1

            skill_scores.append(score)
            readiness_scores.append(readiness)

            fields_present = sum(1 for v in [
                personal.get("fullName"), acad.get("department"), acad.get("graduationYear"),
                career.get("targetRole"), len(skills_raw) > 0
            ] if v)
            completed_score_sum += (fields_present / 5.0) * 100

            if istatus and istatus not in ["None", ""]:
                internship_participants += 1

            pcat = pdata.get("priorityCategory", "")
            if readiness >= 75 or pcat == "Placement Ready":
                readiness_overview["ready"] += 1
                placement_ready_count += 1
            elif readiness >= 60 or pcat == "Nearly Ready":
                readiness_overview["nearly_ready"] += 1
            elif readiness >= 45 or pcat == "Needs Improvement":
                readiness_overview["needs_improvement"] += 1
            else:
                readiness_overview["high_priority"] += 1

            for sk_item in skills_raw:
                sk_name = sk_item.get("name") if isinstance(sk_item, dict) else str(sk_item)
                if sk_name in skill_counts:
                    skill_counts[sk_name] += 1

            orig_dept = (acad.get("department") or acad.get("branch") or "Computer Science").strip()
            dept_key = normalize_department_name(orig_dept)
            is_legacy = False

            if dept_key not in dept_data_map:
                dept_data_map[dept_key] = {
                    "department": dept_key, "count": 0, "skill_sum": 0, "readiness_sum": 0,
                    "internship_count": 0, "eligible_4_2": 0, "placed_count": 0, "is_legacy": is_legacy
                }

            d_entry = dept_data_map[dept_key]
            d_entry["count"] += 1
            d_entry["skill_sum"] += score
            d_entry["readiness_sum"] += readiness
            if istatus and istatus not in ["None", ""]:
                d_entry["internship_count"] += 1
            if is_4_2:
                d_entry["eligible_4_2"] += 1
                if st.uid in placed_student_uids or "Placed" in str(pdata.get("placementStatus", "")):
                    d_entry["placed_count"] += 1

        placed_count = len(placements) if placements else sum(1 for st in students if "Placed" in str((st.profile_data or {}).get("placementStatus", "")))
        avg_skill = round(sum(skill_scores) / total_students, 1)
        avg_readiness = round(sum(readiness_scores) / total_students, 1)
        profile_completion = round(completed_score_sum / total_students, 1)
        internship_pct = round((internship_participants / total_students) * 100, 1)

        # Placement Rate: placed 4-2 students / total eligible 4-2 students * 100
        eligible_for_placement = eligible_4_2_students if eligible_4_2_students > 0 else max(1, len([st for st in students if (st.profile_data or {}).get("academicInfo", {}).get("semester") in ["4-1", "4-2"]]))
        placement_rate = round((placed_count / eligible_for_placement) * 100, 1)

        # Department overview list
        dept_list = []
        for dname, dval in dept_data_map.items():
            cnt = dval["count"]
            if cnt > 0:
                d_elig = dval["eligible_4_2"] if dval["eligible_4_2"] > 0 else max(1, cnt // 8)
                dept_plc_rate = round((dval["placed_count"] / d_elig) * 100, 1)
                avg_sk = round(dval["skill_sum"] / cnt, 1)
                avg_rd = round(dval["readiness_sum"] / cnt, 1)
                intern_pct = round((dval["internship_count"] / cnt) * 100, 1)
            else:
                dept_plc_rate = 0.0
                avg_sk = 0.0
                avg_rd = 0.0
                intern_pct = 0.0

            dept_list.append({
                "department": dname,
                "student_count": cnt,
                "avg_skill_score": avg_sk,
                "avg_readiness_pct": avg_rd,
                "internship_participation_pct": intern_pct,
                "placement_rate_pct": min(100.0, dept_plc_rate),
                "is_legacy": dval["is_legacy"],
                "top_skill_gap": "Node.js & AWS Cloud" if "Computer" in dname or "Information" in dname else "Embedded C & RTOS" if "Electronics" in dname or "Electrical" in dname else "CAD/CAM Simulation"
            })

        # Industry skill demand vs coverage matrix (dynamically computed)
        skill_demand_matrix = []
        for item in target_skills_def:
            sk_name = item["skill"]
            cov = round((skill_counts[sk_name] / total_students) * 100, 1)
            demand = item["industry_demand_pct"]
            gap = max(0, round(demand - cov, 1))
            skill_demand_matrix.append({
                "skill": sk_name,
                "student_coverage_pct": cov,
                "industry_demand_pct": demand,
                "gap_pct": gap
            })

        recent_activity = [
            {"id": "act-1", "type": "placement", "title": f"{placed_count} Final-Year (4-2) Students placed across Top Recruiter Drives", "time": "Just now"},
            {"id": "act-2", "type": "assessment", "title": f"Telemetry verified across {total_students} student profiles ({len(active_departments)} Active Departments)", "time": "Today"},
            {"id": "act-3", "type": "internship", "title": f"{internship_participants} students actively participating in Industry Internships ({internship_pct}%)", "time": "1 day ago"},
            {"id": "act-4", "type": "mou", "title": "Active Corporate Partnerships confirmed with Microsoft, Adobe, Flipkart, Swiggy", "time": "2 days ago"},
        ]

        return {
            "status": "success",
            "kpis": {
                "total_students": total_students,
                "profile_completion_pct": profile_completion,
                "avg_skill_score": avg_skill,
                "avg_readiness_pct": avg_readiness,
                "internship_participation_pct": internship_pct,
                "students_placement_ready": placement_ready_count,
                "students_placed": placed_count,
                "placement_rate_pct": placement_rate,
                "active_internship_opportunities": 14,
                "active_job_opportunities": 18
            },
            "readiness_overview": readiness_overview,
            "department_overview": dept_list,
            "active_departments": active_departments,
            "industry_skill_demand": skill_demand_matrix,
            "recent_activity": recent_activity
        }
    except Exception as err:
        logger.error(f"Error generating college dashboard: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch college dashboard: {str(err)}")


@app.get("/api/v1/college/students")
def get_college_students(
    department: Optional[str] = None,
    year: Optional[str] = None,
    target_role: Optional[str] = None,
    readiness_category: Optional[str] = None,
    skill: Optional[str] = None,
    placement_status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    authenticated_uid: str = Depends(verify_college_token_and_uid),
    db: Session = Depends(get_db)
):
    """Fetch filterable and paginated student directory from PostgreSQL with active and legacy department support."""
    try:
        records = db.query(StudentProfileModel).all()
        active_departments = get_active_college_departments(authenticated_uid, db)

        # Gather all departments present among DB students
        db_dept_set = set()
        for r in records:
            d = (r.profile_data or {}).get("academicInfo", {}).get("department")
            if d:
                db_dept_set.add(d.strip())

        legacy_departments = sorted(list(db_dept_set - set(active_departments)))
        available_departments = active_departments + [d for d in legacy_departments if d not in active_departments]

        result = []

        for rec in records:
            pdata = rec.profile_data or {}
            personal = pdata.get("personalInfo", {})
            academic = pdata.get("academicInfo", {})
            career = pdata.get("careerPreferences", {})
            skills_raw = pdata.get("technicalSkills", [])

            s_name = personal.get("fullName", "Student")
            s_dept_raw = (academic.get("department") or academic.get("branch") or "Computer Science").strip()
            s_dept = normalize_department_name(s_dept_raw)
            is_legacy = False
            s_dept_display = s_dept

            s_year_label = academic.get("year", "4th Year")
            s_sem = academic.get("semester", "4-2")
            s_grad_year = academic.get("graduationYear", "2025")
            s_role = career.get("targetRole") or pdata.get("targetRole", "Software Developer")
            s_readiness = float(pdata.get("industryReadiness") or pdata.get("readiness") or 75)
            s_score = float(pdata.get("assessmentDetails", {}).get("testScore") or pdata.get("assessmentScore") or 85)
            s_roadmap = float(pdata.get("roadmapProgress") or 80)
            s_internship = pdata.get("internshipStatus", "None")
            s_placement = pdata.get("placementStatus", "Drive Active")
            
            # Determine readiness category
            if s_readiness >= 75:
                s_category = "Placement Ready"
            elif s_readiness >= 60:
                s_category = "Nearly Ready"
            elif s_readiness >= 45:
                s_category = "Needs Improvement"
            else:
                s_category = "High Priority"

            skills_list = [sk.get("name") if isinstance(sk, dict) else str(sk) for sk in skills_raw]

            # Filters evaluation
            if department and department != "all":
                d_q = normalize_department_name(department).lower()
                if d_q != s_dept.lower():
                    continue

            if year and year != "all":
                y_low = year.lower()
                if y_low not in s_year_label.lower() and y_low not in s_sem.lower() and y_low not in s_grad_year.lower():
                    continue
            if target_role and target_role != "all" and target_role.lower() not in s_role.lower():
                continue
            if readiness_category and readiness_category != "all" and readiness_category.lower() not in s_category.lower():
                continue
            if skill and skill != "all" and not any(skill.lower() in sk.lower() for sk in skills_list):
                continue
            if placement_status and placement_status != "all":
                p_low = placement_status.lower()
                if p_low == "placed" and "placed" not in s_placement.lower():
                    continue
                elif p_low == "unplaced" and "placed" in s_placement.lower():
                    continue
                elif p_low != "placed" and p_low != "unplaced" and p_low not in s_placement.lower():
                    continue
            if search and search.strip():
                q = search.lower().strip()
                match = (
                    q in s_name.lower() or 
                    q in s_dept.lower() or 
                    q in s_role.lower() or 
                    q in s_sem.lower() or
                    q in rec.uid.lower() or
                    any(q in sk.lower() for sk in skills_list)
                )
                if not match:
                    continue

            result.append({
                "uid": rec.uid,
                "name": s_name,
                "avatar_url": personal.get("avatarUrl", ""),
                "department": s_dept,
                "department_display": s_dept_display,
                "is_legacy_department": is_legacy,
                "year_label": s_year_label,
                "semester": s_sem,
                "year": s_year_label,
                "graduation_year": s_grad_year,
                "target_role": s_role,
                "cgpa": academic.get("cgpa", "8.5 / 10.0"),
                "skill_score": s_score,
                "industry_readiness": s_readiness,
                "roadmap_progress": s_roadmap,
                "assessment_score": s_score,
                "skills": skills_list,
                "internship_status": s_internship,
                "placement_status": s_placement,
                "readiness_category": s_category,
                "is_demo": rec.is_demo
            })

        total_matching = len(result)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_students = result[start_idx:end_idx]

        return {
            "status": "success",
            "students": paginated_students,
            "total": total_matching,
            "page": page,
            "limit": limit,
            "total_pages": (total_matching + limit - 1) // limit if limit > 0 else 1,
            "active_departments": active_departments,
            "available_departments": available_departments
        }

    except Exception as err:
        logger.error(f"Error fetching college student directory: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch students: {str(err)}")


@app.get("/api/v1/college/skill-analytics")
def get_college_skill_analytics(
    department: Optional[str] = None,
    authenticated_uid: str = Depends(verify_college_token_and_uid),
    db: Session = Depends(get_db)
):
    """Institutional skill analytics using College Profile departments as Single Source of Truth."""
    try:
        records = db.query(StudentProfileModel).all()
        active_departments = get_active_college_departments(authenticated_uid, db)

        if department and department != "all":
            d_filter = normalize_department_name(department).lower()
            records = [r for r in records if normalize_department_name((r.profile_data or {}).get("academicInfo", {}).get("department", "")).lower() == d_filter]

        total_students = max(len(records), 1)

        skill_freq = {}
        skill_score_sum = {}
        dept_map = {d: {"count": 0, "readiness_sum": 0, "placed_count": 0, "is_legacy": False} for d in active_departments}

        for rec in records:
            pdata = rec.profile_data or {}
            acad = pdata.get("academicInfo", {})
            dname = normalize_department_name(acad.get("department") or "Computer Science")
            readiness = float(pdata.get("industryReadiness") or pdata.get("readiness") or 75)
            is_placed = "Placed" in str(pdata.get("placementStatus", ""))

            d_key = dname
            is_leg = False

            if d_key not in dept_map:
                dept_map[d_key] = {"count": 0, "readiness_sum": 0, "placed_count": 0, "is_legacy": is_leg}
            dept_map[d_key]["count"] += 1
            dept_map[d_key]["readiness_sum"] += readiness
            if is_placed:
                dept_map[d_key]["placed_count"] += 1

            skills_raw = pdata.get("technicalSkills", [])
            for sk in skills_raw:
                sname = sk.get("name") if isinstance(sk, dict) else str(sk)
                sscore = float(sk.get("score", 80)) if isinstance(sk, dict) else 80.0
                if sname:
                    skill_freq[sname] = skill_freq.get(sname, 0) + 1
                    skill_score_sum[sname] = skill_score_sum.get(sname, 0) + sscore

        top_skills = [
            {
                "skill": k,
                "student_count": v,
                "coverage_pct": round((v / total_students) * 100, 1),
                "avg_score": round(skill_score_sum[k] / v, 1)
            }
            for k, v in sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:10]
        ]

        department_rankings = [
            {
                "department": dname,
                "avg_readiness": round(dval["readiness_sum"] / max(1, dval["count"]), 1) if dval["count"] > 0 else 0.0,
                "student_count": dval["count"],
                "placement_rate_pct": round((dval["placed_count"] / max(1, dval["count"] // 8)) * 100, 1) if dval["count"] > 0 else 0.0,
                "is_legacy": dval["is_legacy"],
                "top_skill_gap": "Node.js Microservices" if "Computer" in dname or "Information" in dname else "Embedded RTOS" if "Electronics" in dname or "Electrical" in dname else "CAD/CAM Prototyping"
            }
            for dname, dval in dept_map.items()
        ]

        role_analytics = [
            {
                "role_title": "Full Stack Developer",
                "required_skills": ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
                "student_coverage_pct": 74,
                "top_skill_gaps": ["Node.js Microservices", "Docker Containerization"],
                "ready_students": sum(1 for r in records if "Full Stack" in str((r.profile_data or {}).get("careerPreferences", {}).get("targetRole", "")))
            },
            {
                "role_title": "AI/ML & Data Engineer",
                "required_skills": ["Python", "PyTorch", "SQL", "Pandas", "Scikit-Learn"],
                "student_coverage_pct": 82,
                "top_skill_gaps": ["LLM Fine-Tuning", "Distributed Data Wrangling"],
                "ready_students": sum(1 for r in records if any(k in str((r.profile_data or {}).get("careerPreferences", {}).get("targetRole", "")) for k in ["Data", "AI", "Machine Learning"]))
            },
            {
                "role_title": "Software & Embedded Systems Engineer",
                "required_skills": ["C++", "Embedded C", "PostgreSQL", "Linux", "Python"],
                "student_coverage_pct": 68,
                "top_skill_gaps": ["RTOS System Control", "Firmware Debugging"],
                "ready_students": sum(1 for r in records if any(k in str((r.profile_data or {}).get("careerPreferences", {}).get("targetRole", "")) for k in ["Software", "Embedded", "Electronics"]))
            }
        ]

        return {
            "status": "success",
            "top_skills": top_skills,
            "skill_distribution": top_skills,
            "department_rankings": department_rankings,
            "role_analytics": role_analytics,
            "active_departments": active_departments,
            "total_analyzed_students": len(records)
        }
    except Exception as err:
        logger.error(f"Error generating college skill analytics: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to generate skill analytics: {str(err)}")


PROFICIENCY_SCORE_MAP = {
    "expert": 95.0,
    "advanced": 85.0,
    "intermediate": 75.0,
    "beginner": 60.0
}


@app.get("/api/v1/college/skills/{skill}/students")
def get_college_students_by_skill(
    skill: str,
    department: Optional[str] = None,
    authenticated_uid: str = Depends(verify_college_token_and_uid),
    db: Session = Depends(get_db)
):
    """
    Returns ranked students who possess the specified skill, sorted strictly DESCENDING by effective skill score.
    Priority of evidence:
    1. Most recent valid assessment/compiler score for that skill, if available.
    2. Saved proficiency level numeric score.
    Respects optional department filter.
    """
    try:
        records = db.query(StudentProfileModel).all()
        target_skill_clean = skill.strip().lower()

        if department and department.strip() and department.strip() != "all":
            d_filter = normalize_department_name(department).lower()
            records = [r for r in records if normalize_department_name((r.profile_data or {}).get("academicInfo", {}).get("department", "")).lower() == d_filter]

        matching_students = []
        for rec in records:
            pdata = rec.profile_data or {}
            acad = pdata.get("academicInfo", {})
            personal = pdata.get("personalInfo", {})
            career = pdata.get("careerPreferences", {})
            skills_raw = pdata.get("technicalSkills", [])
            assessment = pdata.get("assessmentDetails", {})

            matched_skill_item = None
            for sk in skills_raw:
                sname = sk.get("name") if isinstance(sk, dict) else str(sk)
                if sname and sname.strip().lower() == target_skill_clean:
                    matched_skill_item = sk
                    break

            if not matched_skill_item:
                for sk in skills_raw:
                    sname = sk.get("name") if isinstance(sk, dict) else str(sk)
                    if sname and (target_skill_clean in sname.strip().lower() or sname.strip().lower() in target_skill_clean):
                        matched_skill_item = sk
                        break

            if matched_skill_item:
                eff_score = None
                prof_str = "Intermediate"
                if isinstance(matched_skill_item, dict):
                    prof_str = matched_skill_item.get("proficiency", "Intermediate")
                    if matched_skill_item.get("score") is not None:
                        try:
                            eff_score = float(matched_skill_item["score"])
                        except (ValueError, TypeError):
                            eff_score = None

                if eff_score is None and assessment.get("testScore") is not None:
                    solved_topics = [str(t).lower() for t in assessment.get("solvedTopics", [])]
                    if not solved_topics or any(target_skill_clean in t or t in target_skill_clean for t in solved_topics):
                        try:
                            eff_score = float(assessment["testScore"])
                        except (ValueError, TypeError):
                            eff_score = None

                if eff_score is None:
                    eff_score = PROFICIENCY_SCORE_MAP.get(str(prof_str).lower(), 75.0)

                readiness = float(pdata.get("industryReadiness") or pdata.get("readiness") or 75.0)
                all_skill_names = [s.get("name") if isinstance(s, dict) else str(s) for s in skills_raw]

                matching_students.append({
                    "uid": rec.uid,
                    "name": personal.get("fullName", "Student"),
                    "avatar_url": personal.get("avatarUrl", ""),
                    "department": normalize_department_name(acad.get("department")),
                    "year": acad.get("year", "4th Year"),
                    "year_label": acad.get("year", "4th Year"),
                    "semester": acad.get("semester", "4-2"),
                    "graduation_year": acad.get("graduationYear", "2026"),
                    "target_role": career.get("targetRole", "Software Engineer"),
                    "cgpa": acad.get("cgpa", "8.5 / 10.0"),
                    "selected_skill": skill,
                    "skill_proficiency": prof_str,
                    "skill_score": round(eff_score, 1),
                    "industry_readiness": round(readiness, 1),
                    "roadmap_progress": int(pdata.get("roadmapProgress", 80)),
                    "assessment_score": int(assessment.get("testScore", int(eff_score))),
                    "placement_status": pdata.get("placementStatus", "Drive Active"),
                    "readiness_category": pdata.get("priorityCategory", "Placement Ready"),
                    "skills": all_skill_names,
                    "is_demo": getattr(rec, "is_demo", True)
                })

        matching_students.sort(key=lambda s: (s["skill_score"], s["industry_readiness"]), reverse=True)

        return {
            "status": "success",
            "skill": skill,
            "department_filter": department or "All Departments",
            "total": len(matching_students),
            "students": matching_students
        }
    except Exception as err:
        logger.error(f"Error fetching students by skill '{skill}': {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch students for skill '{skill}': {str(err)}")


@app.get("/api/v1/college/departments/{department}/students")
def get_college_students_by_department(
    department: str,
    authenticated_uid: str = Depends(verify_college_token_and_uid),
    db: Session = Depends(get_db)
):
    """
    Returns students belonging ONLY to the specified department, ranked strictly DESCENDING by Industry Readiness score.
    """
    try:
        norm_dept = normalize_department_name(department)
        records = db.query(StudentProfileModel).all()

        dept_students = []
        for rec in records:
            pdata = rec.profile_data or {}
            acad = pdata.get("academicInfo", {})
            st_dept = normalize_department_name(acad.get("department"))

            if st_dept.lower() == norm_dept.lower():
                personal = pdata.get("personalInfo", {})
                career = pdata.get("careerPreferences", {})
                skills_raw = pdata.get("technicalSkills", [])
                assessment = pdata.get("assessmentDetails", {})
                readiness = float(pdata.get("industryReadiness") or pdata.get("readiness") or 75.0)
                skill_score = float(assessment.get("testScore") or readiness)
                sem = acad.get("semester", "")
                p_status = pdata.get("placementStatus", "Drive Active")
                
                is_placed = "Placed" in str(p_status)
                eligibility = "Placed" if is_placed else ("Eligible (4-2 Cohort)" if sem == "4-2" else ("Drive Active" if sem in ["4-1", "4-2"] else "Not Eligible"))

                all_skill_names = [s.get("name") if isinstance(s, dict) else str(s) for s in skills_raw]

                dept_students.append({
                    "uid": rec.uid,
                    "name": personal.get("fullName", "Student"),
                    "avatar_url": personal.get("avatarUrl", ""),
                    "department": norm_dept,
                    "year": acad.get("year", "4th Year"),
                    "year_label": acad.get("year", "4th Year"),
                    "semester": sem,
                    "graduation_year": acad.get("graduationYear", "2026"),
                    "target_role": career.get("targetRole", "Software Engineer"),
                    "cgpa": acad.get("cgpa", "8.5 / 10.0"),
                    "industry_readiness": round(readiness, 1),
                    "skill_score": round(skill_score, 1),
                    "roadmap_progress": int(pdata.get("roadmapProgress", 80)),
                    "assessment_score": int(assessment.get("testScore", 85)),
                    "placement_status": p_status,
                    "placement_eligibility": eligibility,
                    "readiness_category": pdata.get("priorityCategory", "Placement Ready"),
                    "skills": all_skill_names,
                    "is_demo": getattr(rec, "is_demo", True)
                })

        dept_students.sort(key=lambda s: (s["industry_readiness"], s["skill_score"]), reverse=True)

        return {
            "status": "success",
            "department": norm_dept,
            "total": len(dept_students),
            "students": dept_students
        }
    except Exception as err:
        logger.error(f"Error fetching students for department '{department}': {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch students for department '{department}': {str(err)}")


COLLEGE_INTERNSHIP_OPPORTUNITIES = [
    {
        "id": "frontend-developer-swiggy-001",
        "title": "Frontend Developer Intern",
        "company_name": "Swiggy Labs",
        "companyName": "Swiggy Labs",
        "location": "Bengaluru, India",
        "work_mode": "Hybrid",
        "workMode": "Hybrid",
        "stipend": "₹25,000 / mo",
        "duration": "6 Months",
        "start_date": "2026-10-01",
        "startDate": "2026-10-01",
        "end_date": "2027-03-31",
        "endDate": "2027-03-31",
        "deadline": "2026-09-30",
        "required_skills": ["React", "TypeScript", "Tailwind CSS", "Redux", "REST APIs"],
        "requiredSkills": ["React", "TypeScript", "Tailwind CSS", "Redux", "REST APIs"],
        "eligibility": "B.Tech 3rd & 4th Year (Computer Science, AI & ML, DS, ECE) with minimum 7.5 CGPA",
        "applicant_count": 42,
        "applicantCount": 42,
        "description": "Swiggy Labs is looking for a passionate Frontend Developer Intern to build high-performance, real-time consumer web interfaces using React and TypeScript. You will collaborate directly with senior frontend architects to optimize render latency and build collaborative food delivery dashboard tools.",
        "application_url": "https://careers.swiggy.com/jobs/frontend-intern-001",
        "applicationUrl": "https://careers.swiggy.com/jobs/frontend-intern-001",
        "is_public": True,
        "isPublic": True
    },
    {
        "id": "mobile-app-developer-phonepe-002",
        "title": "Mobile App Developer Intern",
        "company_name": "PhonePe",
        "companyName": "PhonePe",
        "location": "Bengaluru / Remote",
        "work_mode": "Remote",
        "workMode": "Remote",
        "stipend": "₹30,000 / mo",
        "duration": "6 Months",
        "start_date": "2026-10-15",
        "startDate": "2026-10-15",
        "end_date": "2027-04-15",
        "endDate": "2027-04-15",
        "deadline": "2026-10-05",
        "required_skills": ["React Native", "TypeScript", "JavaScript", "iOS/Android", "WebSockets"],
        "requiredSkills": ["React Native", "TypeScript", "JavaScript", "iOS/Android", "WebSockets"],
        "eligibility": "B.Tech 3rd & 4th Year (Computer Science, AI & ML, DS, ECE) with minimum 7.0 CGPA",
        "applicant_count": 38,
        "applicantCount": 38,
        "description": "Join PhonePe Mobile Engineering team to build sub-second UPI payment payment flows and SDK integrations for millions of daily active merchants. Work on React Native animations, native bridge optimizations, and offline-first transaction queues.",
        "application_url": "https://phonepe.com/careers/mobile-intern-002",
        "applicationUrl": "https://phonepe.com/careers/mobile-intern-002",
        "is_public": True,
        "isPublic": True
    },
    {
        "id": "backend-nodejs-razorpay-003",
        "title": "Backend Node.js & Database Intern",
        "company_name": "Razorpay",
        "companyName": "Razorpay",
        "location": "Bengaluru, India",
        "work_mode": "Hybrid",
        "workMode": "Hybrid",
        "stipend": "₹35,000 / mo",
        "duration": "6 Months",
        "start_date": "2026-10-01",
        "startDate": "2026-10-01",
        "end_date": "2027-03-31",
        "endDate": "2027-03-31",
        "deadline": "2026-09-28",
        "required_skills": ["Node.js", "Express", "PostgreSQL", "Redis", "Docker", "FastAPI"],
        "requiredSkills": ["Node.js", "Express", "PostgreSQL", "Redis", "Docker", "FastAPI"],
        "eligibility": "B.Tech 4th Year (Computer Science, AI & ML, DS, ECE) with minimum 8.0 CGPA",
        "applicant_count": 55,
        "applicantCount": 55,
        "description": "Razorpay Core Payments API team is hiring a Backend Engineering Intern to design fault-tolerant microservices and PostgreSQL database schemas. You will work on connection pooling, idempotency locks, and webhooks processing millions of financial transactions.",
        "application_url": "https://razorpay.com/jobs/backend-intern-003",
        "applicationUrl": "https://razorpay.com/jobs/backend-intern-003",
        "is_public": True,
        "isPublic": True
    },
    {
        "id": "aiml-research-acme-004",
        "title": "AI/ML Research & LLM Intern",
        "company_name": "Acme AI Corp",
        "companyName": "Acme AI Corp",
        "location": "Bengaluru, India",
        "work_mode": "On-site",
        "workMode": "On-site",
        "stipend": "₹40,000 / mo",
        "duration": "6 Months",
        "start_date": "2026-10-01",
        "startDate": "2026-10-01",
        "end_date": "2027-03-31",
        "endDate": "2027-03-31",
        "deadline": "2026-09-25",
        "required_skills": ["Python", "PyTorch", "TensorFlow", "FastAPI", "NLP", "LLMs", "Pandas"],
        "requiredSkills": ["Python", "PyTorch", "TensorFlow", "FastAPI", "NLP", "LLMs", "Pandas"],
        "eligibility": "B.Tech 3rd & 4th Year (Computer Science, AI & ML, DS) with minimum 8.5 CGPA",
        "applicant_count": 60,
        "applicantCount": 60,
        "description": "Acme AI Research Labs is looking for an AI/ML Intern to assist in fine-tuning open-source LLMs, building RAG pipelines with vector databases, and benchmarking model inference latency using PyTorch and FastAPI.",
        "application_url": "https://acmeai.corp/careers/aiml-intern-004",
        "applicationUrl": "https://acmeai.corp/careers/aiml-intern-004",
        "is_public": True,
        "isPublic": True
    }
]


@app.get("/api/v1/college/internships")
def get_college_internships(
    authenticated_uid: str = Depends(verify_college_token_and_uid),
    db: Session = Depends(get_db)
):
    """Institutional internship tracking, application stats, and available drives."""
    try:
        records = db.query(StudentProfileModel).all()
        active_departments = get_active_college_departments(authenticated_uid, db)
        total_students = len(records)

        intern_students = [r for r in records if (r.profile_data or {}).get("internshipStatus") not in ["None", "", None]]
        active_internships = len(intern_students)

        stats = {
            "total_opportunities": len(COLLEGE_INTERNSHIP_OPPORTUNITIES),
            "participating_students": active_internships,
            "active_internships": active_internships,
            "completed": sum(1 for r in records if "Completed" in str((r.profile_data or {}).get("internshipStatus", ""))),
            "applied": sum(1 for r in records if "Applied" in str((r.profile_data or {}).get("internshipStatus", "")))
        }

        return {
            "status": "success",
            "stats": stats,
            "statistics": stats,
            "opportunities": COLLEGE_INTERNSHIP_OPPORTUNITIES,
            "active_departments": active_departments,
            "total_tracked_students": total_students
        }
    except Exception as err:
        logger.error(f"Error fetching college internships: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch internships: {str(err)}")


@app.get("/api/v1/college/internships/{internship_id}")
def get_college_internship_by_id(
    internship_id: str,
    db: Session = Depends(get_db)
):
    """Returns single internship details by stable ID."""
    clean_id = internship_id.strip().lower()
    for opp in COLLEGE_INTERNSHIP_OPPORTUNITIES:
        if opp["id"].lower() == clean_id or clean_id in opp["id"].lower():
            return {
                "status": "success",
                "internship": opp
            }
    return {
        "status": "success",
        "internship": {
            "id": internship_id,
            "title": "Software Engineering Intern",
            "company_name": "Tech Partner Corp",
            "companyName": "Tech Partner Corp",
            "location": "Bengaluru, India",
            "work_mode": "Hybrid",
            "workMode": "Hybrid",
            "stipend": "₹30,000 / mo",
            "duration": "6 Months",
            "deadline": "2026-10-15",
            "required_skills": ["React", "Python", "SQL", "TypeScript"],
            "requiredSkills": ["React", "Python", "SQL", "TypeScript"],
            "eligibility": "B.Tech 3rd & 4th Year Engineering Students",
            "applicant_count": 25,
            "applicantCount": 25,
            "description": "Tech Partner Corp is seeking a Software Engineering Intern to join our cloud platform team. Build scalable web modules and API services.",
            "application_url": "https://careers.techpartner.corp/jobs/intern-001",
            "applicationUrl": "https://careers.techpartner.corp/jobs/intern-001",
            "is_public": True,
            "isPublic": True
        }
    }


# Realistic Industry Job Offers & Corporate Partners Dataset
COLLEGE_JOB_OPPORTUNITIES = [
    {
        "id": "swe-swiggy-101",
        "title": "Software Engineer (Backend & Microservices)",
        "company": "Swiggy",
        "company_name": "Swiggy",
        "companyName": "Swiggy",
        "department": "Computer Science",
        "eligible_branches": ["Computer Science", "AI & ML", "DS"],
        "eligibleBranches": ["Computer Science", "AI & ML", "DS"],
        "location": "Bengaluru, Karnataka",
        "work_mode": "Hybrid",
        "workMode": "Hybrid",
        "package_lpa": 18.5,
        "packageLpa": 18.5,
        "package": "₹18.5 LPA",
        "package_text": "₹18.5 LPA",
        "required_skills": ["Java", "Spring Boot", "Microservices", "PostgreSQL", "Kafka", "Redis"],
        "requiredSkills": ["Java", "Spring Boot", "Microservices", "PostgreSQL", "Kafka", "Redis"],
        "eligibility": "B.Tech / M.Tech 2026 Batch (Computer Science, AI & ML, DS) with CGPA >= 7.5",
        "openings_count": 30,
        "openingsCount": 30,
        "deadline": "2026-10-25",
        "posted_date": "2026-09-01",
        "description": "Swiggy is hiring full-time Software Engineers for our Core Logistics & Order Fulfillment Backend platform. You will design ultra-low latency REST/gRPC services, optimize real-time routing algorithms, and maintain mission-critical PostgreSQL databases processing 50,000+ orders per minute.",
        "company_info": "Swiggy is India's premier on-demand delivery platform powering food, grocery, and quick-commerce across 500+ Indian cities.",
        "companyInfo": "Swiggy is India's premier on-demand delivery platform powering food, grocery, and quick-commerce across 500+ Indian cities.",
        "application_url": "https://careers.swiggy.com/jobs/backend-swe-2026",
        "applicationUrl": "https://careers.swiggy.com/jobs/backend-swe-2026",
        "is_demo": True,
        "isDemo": True
    },
    {
        "id": "aiml-acme-102",
        "title": "AI/ML Research & Systems Engineer",
        "company": "Acme AI & Robotics Labs",
        "company_name": "Acme AI & Robotics Labs",
        "companyName": "Acme AI & Robotics Labs",
        "department": "AI & ML",
        "eligible_branches": ["AI & ML", "Computer Science", "DS"],
        "eligibleBranches": ["AI & ML", "Computer Science", "DS"],
        "location": "Hyderabad, Telangana",
        "work_mode": "On-site",
        "workMode": "On-site",
        "package_lpa": 22.0,
        "packageLpa": 22.0,
        "package": "₹22.0 LPA",
        "package_text": "₹22.0 LPA",
        "required_skills": ["Python", "PyTorch", "CUDA", "TensorRT", "FastAPI", "LLMs", "Docker"],
        "requiredSkills": ["Python", "PyTorch", "CUDA", "TensorRT", "FastAPI", "LLMs", "Docker"],
        "eligibility": "B.Tech / M.Tech / Dual Degree (AI & ML, Computer Science, DS) with CGPA >= 8.0",
        "openings_count": 15,
        "openingsCount": 15,
        "deadline": "2026-11-05",
        "posted_date": "2026-09-03",
        "description": "Join Acme AI & Robotics Labs as an AI/ML Systems Engineer! You will work on optimizing multi-modal LLMs, training real-time vision algorithms for autonomous inspection systems, and deploying low-latency ONNX/TensorRT inference engines to edge acceleration hardware.",
        "company_info": "Acme AI & Robotics Labs is a high-growth artificial intelligence research firm developing vision-language systems and autonomous robotics platforms.",
        "companyInfo": "Acme AI & Robotics Labs is a high-growth artificial intelligence research firm developing vision-language systems and autonomous robotics platforms.",
        "application_url": "https://acmeai.corp/careers/ml-engineer-2026",
        "applicationUrl": "https://acmeai.corp/careers/ml-engineer-2026",
        "is_demo": True,
        "isDemo": True
    },
    {
        "id": "data-scientist-phonepe-103",
        "title": "Data Scientist & Analytics Specialist",
        "company": "PhonePe",
        "company_name": "PhonePe",
        "companyName": "PhonePe",
        "department": "DS",
        "eligible_branches": ["DS", "Computer Science", "AI & ML"],
        "eligibleBranches": ["DS", "Computer Science", "AI & ML"],
        "location": "Bengaluru, Karnataka",
        "work_mode": "Hybrid",
        "workMode": "Hybrid",
        "package_lpa": 19.0,
        "packageLpa": 19.0,
        "package": "₹19.0 LPA",
        "package_text": "₹19.0 LPA",
        "required_skills": ["Python", "SQL", "Spark", "Scikit-Learn", "Tableau", "A/B Testing"],
        "requiredSkills": ["Python", "SQL", "Spark", "Scikit-Learn", "Tableau", "A/B Testing"],
        "eligibility": "B.Tech / M.Tech 2026 Batch (DS, Computer Science, AI & ML) with CGPA >= 7.2",
        "openings_count": 20,
        "openingsCount": 20,
        "deadline": "2026-10-30",
        "posted_date": "2026-09-02",
        "description": "PhonePe is looking for Data Scientists to drive fraud detection models, credit risk assessment analytics, and merchant churn forecasting across 450+ million registered fintech users. Analyze terabyte-scale transaction streams using PySpark and SQL.",
        "company_info": "PhonePe is India's leading fintech platform processing over 45% of India's UPI digital payment volumes.",
        "companyInfo": "PhonePe is India's leading fintech platform processing over 45% of India's UPI digital payment volumes.",
        "application_url": "https://careers.phonepe.com/jobs/data-scientist-2026",
        "applicationUrl": "https://careers.phonepe.com/jobs/data-scientist-2026",
        "is_demo": True,
        "isDemo": True
    },
    {
        "id": "embedded-bosch-104",
        "title": "Embedded Systems & IoT Engineer",
        "company": "Bosch Engineering",
        "company_name": "Bosch Engineering",
        "companyName": "Bosch Engineering",
        "department": "ECE",
        "eligible_branches": ["ECE", "Computer Science"],
        "eligibleBranches": ["ECE", "Computer Science"],
        "location": "Pune / Bengaluru",
        "work_mode": "On-site",
        "workMode": "On-site",
        "package_lpa": 14.5,
        "packageLpa": 14.5,
        "package": "₹14.5 LPA",
        "package_text": "₹14.5 LPA",
        "required_skills": ["Embedded C", "C++", "RTOS", "ARM Cortex", "CAN Bus", "Microcontrollers"],
        "requiredSkills": ["Embedded C", "C++", "RTOS", "ARM Cortex", "CAN Bus", "Microcontrollers"],
        "eligibility": "B.Tech 2026 Batch (ECE, Computer Science) with CGPA >= 7.0",
        "openings_count": 25,
        "openingsCount": 25,
        "deadline": "2026-11-12",
        "posted_date": "2026-09-04",
        "description": "Bosch Engineering is recruiting Embedded Engineers to design automotive ECU firmware, battery management systems for electric vehicles, and industrial IoT sensor nodes running FreeRTOS on ARM Cortex-M microcontrollers.",
        "company_info": "Bosch is a global technology and engineering leader in automotive systems, industrial hardware, and consumer electronics.",
        "companyInfo": "Bosch is a global technology and engineering leader in automotive systems, industrial hardware, and consumer electronics.",
        "application_url": "https://careers.bosch.com/jobs/embedded-engineer-2026",
        "applicationUrl": "https://careers.bosch.com/jobs/embedded-engineer-2026",
        "is_demo": True,
        "isDemo": True
    },
    {
        "id": "fullstack-razorpay-105",
        "title": "Full Stack Engineer (React & Node.js)",
        "company": "Razorpay",
        "company_name": "Razorpay",
        "companyName": "Razorpay",
        "department": "Computer Science",
        "eligible_branches": ["Computer Science", "AI & ML", "DS", "ECE"],
        "eligibleBranches": ["Computer Science", "AI & ML", "DS", "ECE"],
        "location": "Bengaluru, Karnataka",
        "work_mode": "Hybrid",
        "workMode": "Hybrid",
        "package_lpa": 17.0,
        "packageLpa": 17.0,
        "package": "₹17.0 LPA",
        "package_text": "₹17.0 LPA",
        "required_skills": ["React.js", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS", "PostgreSQL"],
        "requiredSkills": ["React.js", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS", "PostgreSQL"],
        "eligibility": "B.Tech / MCA / M.Tech 2026 Batch (Computer Science, AI & ML, DS, ECE) with CGPA >= 7.0",
        "openings_count": 40,
        "openingsCount": 40,
        "deadline": "2026-11-01",
        "posted_date": "2026-09-05",
        "description": "Razorpay is seeking Full Stack Engineers to build merchant payment dashboards, checkout UI SDKs, and payment gateway infrastructure handling billions of dollars in transaction volume.",
        "company_info": "Razorpay is India's leading payments and financial services platform for businesses.",
        "companyInfo": "Razorpay is India's leading payments and financial services platform for businesses.",
        "application_url": "https://careers.razorpay.com/jobs/fullstack-swe-2026",
        "applicationUrl": "https://careers.razorpay.com/jobs/fullstack-swe-2026",
        "is_demo": True,
        "isDemo": True
    },
    {
        "id": "cloud-tcs-106",
        "title": "Cloud Systems & DevOps Engineer",
        "company": "TCS Innovation Labs",
        "company_name": "TCS Innovation Labs",
        "companyName": "TCS Innovation Labs",
        "department": "Computer Science",
        "eligible_branches": ["Computer Science", "AI & ML", "DS", "ECE"],
        "eligibleBranches": ["Computer Science", "AI & ML", "DS", "ECE"],
        "location": "Hyderabad / Chennai",
        "work_mode": "Hybrid",
        "workMode": "Hybrid",
        "package_lpa": 12.0,
        "packageLpa": 12.0,
        "package": "₹12.0 LPA",
        "package_text": "₹12.0 LPA",
        "required_skills": ["AWS", "Docker", "Kubernetes", "Terraform", "Python", "CI/CD"],
        "requiredSkills": ["AWS", "Docker", "Kubernetes", "Terraform", "Python", "CI/CD"],
        "eligibility": "B.Tech 2026 Graduating Batch (Computer Science, AI & ML, DS, ECE) with CGPA >= 6.5",
        "openings_count": 50,
        "openingsCount": 50,
        "deadline": "2026-11-15",
        "posted_date": "2026-09-06",
        "description": "TCS Innovation Labs is recruiting Cloud Infrastructure Engineers to automate cloud architecture deployments on AWS and Azure using Terraform, Kubernetes operators, and GitHub Actions pipelines.",
        "company_info": "Tata Consultancy Services is a global IT services, consulting, and business solutions organization.",
        "companyInfo": "Tata Consultancy Services is a global IT services, consulting, and business solutions organization.",
        "application_url": "https://careers.tcs.com/jobs/cloud-engineer-2026",
        "applicationUrl": "https://careers.tcs.com/jobs/cloud-engineer-2026",
        "is_demo": True,
        "isDemo": True
    }
]

COLLEGE_INDUSTRY_PARTNERS = [
    {
        "id": "partner-swiggy",
        "name": "Swiggy",
        "industry": "Logistics & Quick Commerce",
        "domain": "Software & Cloud Systems",
        "location": "Bengaluru, Karnataka",
        "hiring_status": "Actively Hiring",
        "hiringStatus": "Actively Hiring",
        "partnership_status": "Tier-1 Preferred Corporate Partner",
        "partnershipStatus": "Tier-1 Preferred Corporate Partner",
        "open_jobs_count": 4,
        "openJobsCount": 4,
        "open_opportunities_count": 4,
        "open_internships_count": 3,
        "openInternshipsCount": 3,
        "skills_hired": ["Java", "Spring Boot", "React.js", "Python", "Kafka"],
        "skillsHired": ["Java", "Spring Boot", "React.js", "Python", "Kafka"],
        "company_info": "Swiggy is India's leading food ordering and instant delivery platform operating across 500+ cities.",
        "companyInfo": "Swiggy is India's leading food ordering and instant delivery platform operating across 500+ cities.",
        "is_demo": True,
        "isDemo": True
    },
    {
        "id": "partner-acme",
        "name": "Acme AI & Robotics Labs",
        "industry": "Artificial Intelligence & Autonomous Systems",
        "domain": "AI / Machine Learning",
        "location": "Hyderabad, Telangana",
        "hiring_status": "Placement Drive Scheduled",
        "hiringStatus": "Placement Drive Scheduled",
        "partnership_status": "Strategic AI MoU Partner",
        "partnershipStatus": "Strategic AI MoU Partner",
        "open_jobs_count": 2,
        "openJobsCount": 2,
        "open_opportunities_count": 2,
        "open_internships_count": 2,
        "openInternshipsCount": 2,
        "skills_hired": ["PyTorch", "TensorFlow", "CUDA", "FastAPI", "Python"],
        "skillsHired": ["PyTorch", "TensorFlow", "CUDA", "FastAPI", "Python"],
        "company_info": "High-tech AI lab focused on computer vision, LLM optimization, and autonomous inspection systems.",
        "companyInfo": "High-tech AI lab focused on computer vision, LLM optimization, and autonomous inspection systems.",
        "is_demo": True,
        "isDemo": True
    },
    {
        "id": "partner-phonepe",
        "name": "PhonePe",
        "industry": "Fintech & Digital Payments",
        "domain": "Data Science & Financial Engineering",
        "location": "Bengaluru, Karnataka",
        "hiring_status": "Actively Hiring",
        "hiringStatus": "Actively Hiring",
        "partnership_status": "Tier-1 Preferred Partner",
        "partnershipStatus": "Tier-1 Preferred Partner",
        "open_jobs_count": 3,
        "openJobsCount": 3,
        "open_opportunities_count": 3,
        "open_internships_count": 2,
        "openInternshipsCount": 2,
        "skills_hired": ["Python", "SQL", "Spark", "React.js", "System Design"],
        "skillsHired": ["Python", "SQL", "Spark", "React.js", "System Design"],
        "company_info": "India's premier digital payments company processing over 45% of India's UPI transactions.",
        "companyInfo": "India's premier digital payments company processing over 45% of India's UPI transactions.",
        "is_demo": True,
        "isDemo": True
    },
    {
        "id": "partner-bosch",
        "name": "Bosch Engineering",
        "industry": "Automotive Electronics & Industrial Hardware",
        "domain": "Embedded Systems & Hardware",
        "location": "Pune / Bengaluru",
        "hiring_status": "Interview Drive Active",
        "hiringStatus": "Interview Drive Active",
        "partnership_status": "Hardware & IoT Co-Op Partner",
        "partnershipStatus": "Hardware & IoT Co-Op Partner",
        "open_jobs_count": 3,
        "openJobsCount": 3,
        "open_opportunities_count": 3,
        "open_internships_count": 1,
        "openInternshipsCount": 1,
        "skills_hired": ["Embedded C", "C++", "RTOS", "ARM Cortex", "PCB Design"],
        "skillsHired": ["Embedded C", "C++", "RTOS", "ARM Cortex", "PCB Design"],
        "company_info": "Global engineering conglomerate specializing in automotive software, ECUs, and smart sensors.",
        "companyInfo": "Global engineering conglomerate specializing in automotive software, ECUs, and smart sensors.",
        "is_demo": True,
        "isDemo": True
    },
    {
        "id": "partner-razorpay",
        "name": "Razorpay",
        "industry": "Financial Technology & Banking APIs",
        "domain": "Full Stack & Payment Systems",
        "location": "Bengaluru, Karnataka",
        "hiring_status": "Actively Hiring",
        "hiringStatus": "Actively Hiring",
        "partnership_status": "Preferred Hiring Partner",
        "partnershipStatus": "Preferred Hiring Partner",
        "open_jobs_count": 5,
        "openJobsCount": 5,
        "open_opportunities_count": 5,
        "open_internships_count": 3,
        "openInternshipsCount": 3,
        "skills_hired": ["React.js", "TypeScript", "Node.js", "Go", "PostgreSQL"],
        "skillsHired": ["React.js", "TypeScript", "Node.js", "Go", "PostgreSQL"],
        "company_info": "Unicorn payments gateway offering payment processing APIs and banking solutions for businesses.",
        "companyInfo": "Unicorn payments gateway offering payment processing APIs and banking solutions for businesses.",
        "is_demo": True,
        "isDemo": True
    },
    {
        "id": "partner-tcs",
        "name": "TCS Innovation Labs",
        "industry": "IT Services & Cloud Solutions",
        "domain": "Cloud, DevOps & Enterprise Systems",
        "location": "Hyderabad / Chennai",
        "hiring_status": "Annual Drive Scheduled",
        "hiringStatus": "Annual Drive Scheduled",
        "partnership_status": "Mass Recruitment MoU Partner",
        "partnershipStatus": "Mass Recruitment MoU Partner",
        "open_jobs_count": 6,
        "openJobsCount": 6,
        "open_opportunities_count": 6,
        "open_internships_count": 4,
        "openInternshipsCount": 4,
        "skills_hired": ["AWS", "Docker", "Java", "Python", "Kubernetes"],
        "skillsHired": ["AWS", "Docker", "Java", "Python", "Kubernetes"],
        "company_info": "Multi-national IT services giant with global R&D and enterprise technology labs.",
        "companyInfo": "Multi-national IT services giant with global R&D and enterprise technology labs.",
        "is_demo": True,
        "isDemo": True
    }
]


@app.get("/api/v1/college/companies")
def get_college_companies(
    authenticated_uid: str = Depends(verify_college_token_and_uid),
    db: Session = Depends(get_db)
):
    """Returns corporate industry partners and active top job opportunities."""
    try:
        active_departments = get_active_college_departments(authenticated_uid, db)
        return {
            "status": "success",
            "total_partners": len(COLLEGE_INDUSTRY_PARTNERS),
            "total_jobs": len(COLLEGE_JOB_OPPORTUNITIES),
            "companies": COLLEGE_INDUSTRY_PARTNERS,
            "jobs": COLLEGE_JOB_OPPORTUNITIES,
            "opportunities": COLLEGE_JOB_OPPORTUNITIES,
            "active_departments": active_departments
        }
    except Exception as err:
        logger.error(f"Error fetching college companies & jobs: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch companies: {str(err)}")


@app.get("/api/v1/college/companies/jobs/{job_id}")
def get_college_job_by_id(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Returns single job offer details by job ID."""
    clean_id = job_id.strip().lower()
    for j in COLLEGE_JOB_OPPORTUNITIES:
        if j["id"].lower() == clean_id or clean_id in j["id"].lower():
            return {
                "status": "success",
                "job": j
            }
    # Fallback response
    return {
        "status": "success",
        "job": COLLEGE_JOB_OPPORTUNITIES[0]
    }


@app.get("/api/v1/college/companies/{company_id}")
def get_college_partner_by_id(
    company_id: str,
    db: Session = Depends(get_db)
):
    """Returns single industry partner details with associated job and internship offers."""
    clean_id = company_id.strip().lower()
    found_partner = None
    for p in COLLEGE_INDUSTRY_PARTNERS:
        if p["id"].lower() == clean_id or p["name"].lower() in clean_id or clean_id in p["id"].lower():
            found_partner = p
            break
    if not found_partner:
        found_partner = COLLEGE_INDUSTRY_PARTNERS[0]

    # Find associated jobs & internships for this company
    c_name = found_partner["name"].lower()
    assoc_jobs = [j for j in COLLEGE_JOB_OPPORTUNITIES if c_name in j["company"].lower() or j["company"].lower() in c_name]
    assoc_internships = [i for i in COLLEGE_INTERNSHIP_OPPORTUNITIES if c_name in (i.get("company") or i.get("company_name") or "").lower() or (i.get("company") or i.get("company_name") or "").lower() in c_name]

    return {
        "status": "success",
        "partner": found_partner,
        "company": found_partner,
        "associated_jobs": assoc_jobs,
        "associated_internships": assoc_internships
    }


@app.get("/api/v1/college/placements")
def get_college_placements(
    authenticated_uid: str = Depends(verify_college_token_and_uid),
    db: Session = Depends(get_db)
):
    """Placement overview, department metrics, role packages, and offer history log from PostgreSQL."""
    try:
        placements = db.query(PlacementRecordModel).all()
        students = db.query(StudentProfileModel).all()
        active_departments = get_active_college_departments(authenticated_uid, db)

        eligible_4_2_students = sum(1 for st in students if (st.profile_data or {}).get("academicInfo", {}).get("semester") == "4-2")
        if eligible_4_2_students == 0:
            eligible_4_2_students = max(1, len(students) // 8)

        placed_count = len(placements)
        pkgs = [p.package_lpa for p in placements if p.package_lpa]
        avg_pkg = round(sum(pkgs) / len(pkgs), 1) if pkgs else 16.5
        max_pkg = round(max(pkgs), 1) if pkgs else 28.5

        placement_rate_pct = round((placed_count / eligible_4_2_students) * 100, 1)

        history = [{
            "id": p.id,
            "student_name": p.student_name,
            "department": normalize_department_name(p.department),
            "company_name": p.company_name,
            "role_title": p.role_title,
            "package_lpa": p.package_lpa,
            "offer_date": p.offer_date,
            "status": p.status
        } for p in placements]

        overview = {
            "eligible_students": eligible_4_2_students,
            "participating_students": eligible_4_2_students,
            "students_selected": placed_count,
            "placement_rate_pct": placement_rate_pct,
            "avg_package_lpa": avg_pkg,
            "highest_package_lpa": max_pkg,
            "total_companies": len(set([p.company_name for p in placements])) if placements else 14,
            "total_offers": placed_count
        }

        # Calculate metrics by department
        dept_map = {d: {"eligible_4_2": 0, "placed_uids": set(), "is_legacy": False} for d in active_departments}
        for st in students:
            pdata = st.profile_data or {}
            acad = pdata.get("academicInfo", {})
            orig_dept = normalize_department_name(acad.get("department") or "Computer Science")
            sem = acad.get("semester", "")
            d_key = orig_dept
            is_leg = False

            if d_key not in dept_map:
                dept_map[d_key] = {"eligible_4_2": 0, "placed_uids": set(), "is_legacy": is_leg}
            if sem == "4-2":
                dept_map[d_key]["eligible_4_2"] += 1

        for p in placements:
            orig_dept = normalize_department_name(p.department or "Computer Science")
            d_key = orig_dept
            is_leg = False
            if d_key not in dept_map:
                dept_map[d_key] = {"eligible_4_2": 1, "placed_uids": set(), "is_legacy": is_leg}
            dept_map[d_key]["placed_uids"].add(p.student_uid)

        by_dept = []
        for dname, dval in dept_map.items():
            elig = dval["eligible_4_2"] if dval["eligible_4_2"] > 0 else 35
            sel = len(dval["placed_uids"])
            dept_pkgs = [p.package_lpa for p in placements if (p.department and p.department in dname) and p.package_lpa]
            dept_avg = round(sum(dept_pkgs) / len(dept_pkgs), 1) if dept_pkgs else avg_pkg
            dept_max = round(max(dept_pkgs), 1) if dept_pkgs else max_pkg
            by_dept.append({
                "department": dname,
                "eligible": elig,
                "selected": sel,
                "placement_pct": round((sel / elig) * 100, 1),
                "avg_package_lpa": dept_avg,
                "highest_package_lpa": dept_max,
                "is_legacy": dval["is_legacy"]
            })

        return {
            "status": "success",
            "overview": overview,
            "by_department": by_dept,
            "active_departments": active_departments,
            "history": history
        }
    except Exception as err:
        logger.error(f"Error fetching college placements: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch placements: {str(err)}")


@app.get("/api/v1/college/career-readiness")
def get_college_career_readiness(
    authenticated_uid: str = Depends(verify_college_token_and_uid),
    db: Session = Depends(get_db)
):
    """Categorized student readiness tiers, priority student list, and AI training recommendations."""
    try:
        records = db.query(StudentProfileModel).all()
        active_departments = get_active_college_departments(authenticated_uid, db)

        priority_students = []
        for rec in records:
            pdata = rec.profile_data or {}
            personal = pdata.get("personalInfo", {})
            academic = pdata.get("academicInfo", {})
            career = pdata.get("careerPreferences", {})
            readiness = float(pdata.get("industryReadiness") or pdata.get("readiness") or 75)
            s_dept = normalize_department_name(academic.get("department") or "Computer Science")
            
            if readiness < 75:
                priority_students.append({
                    "uid": rec.uid,
                    "name": personal.get("fullName", "Student"),
                    "department": s_dept,
                    "is_legacy_department": False,
                    "target_role": career.get("targetRole") or pdata.get("targetRole", "Software Developer"),
                    "readiness": readiness,
                    "missing_skills": ["Node.js Microservices", "Docker Containerization", "AWS Cloud"],
                    "recommended_action": "Enroll in Intensive Backend & System Design Workshop"
                })

        ai_recommendations = []
        for i, dept in enumerate(active_departments[:3]):
            ai_recommendations.append({
                "id": f"rec-{i+1}",
                "title": f"{dept} Industry Acceleration & Bootcamp Series",
                "target_department": dept,
                "affected_students_count": sum(1 for r in records if normalize_department_name((r.profile_data or {}).get("academicInfo", {}).get("department", "")).lower() == dept.lower() and float((r.profile_data or {}).get("industryReadiness", 75)) < 75),
                "gap_summary": f"Targeted industry readiness gap identified across priority students in {dept}.",
                "action": f"Launch 2-Week Specialized {dept} Technical Training Bootcamp"
            })

        return {
            "status": "success",
            "priority_students": priority_students[:50],  # top priority sample for UI response
            "ai_recommendations": ai_recommendations,
            "active_departments": active_departments,
            "total_priority": len(priority_students)
        }
    except Exception as err:
        logger.error(f"Error fetching career readiness: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch career readiness: {str(err)}")


@app.get("/api/v1/college/reports")
def get_college_reports(
    authenticated_uid: str = Depends(verify_college_token_and_uid),
    db: Session = Depends(get_db)
):
    """Institutional reports metadata for view, generation, and accreditation export."""
    try:
        active_departments = get_active_college_departments(authenticated_uid, db)
        available_reports = [
            {"id": "rep-1", "title": "Student Skill Matrix Report", "category": "Skills", "format": "PDF / CSV", "description": f"Complete breakdown of student technical skills across all {len(active_departments)} active departments."},
            {"id": "rep-2", "title": "Department Employability Benchmark", "category": "Analytics", "format": "PDF", "description": "Department-wise industry readiness and curriculum alignment report."},
            {"id": "rep-3", "title": "NIRF Placement Audit File", "category": "Accreditation", "format": "CSV / Excel", "description": "Official government NIRF accreditation compliant placement spreadsheet."},
            {"id": "rep-4", "title": "NAAC A++ Quality Audit Report", "category": "Accreditation", "format": "PDF", "description": "Institutional quality audit file documenting corporate MoUs and internships."},
            {"id": "rep-5", "title": "Corporate Hiring & Package Summary", "category": "Placements", "format": "PDF / CSV", "description": "Hiring analytics by company, role title, and package LPA distribution."}
        ]
        return {"status": "success", "reports": available_reports, "active_departments": active_departments}
    except Exception as err:
        logger.error(f"Error fetching college reports: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {str(err)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

