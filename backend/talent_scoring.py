"""
SkillBridge — Top Talent Discovery Scoring Engine

Computes a transparent multi-factor talent score from real PostgreSQL
student profile data.  Every score is derived from actual stored fields;
nothing is hardcoded or faked.

Factors & Weights:
  1. Target-role alignment       15 %
  2. Required-skill match        20 %
  3. Skill proficiency avg       15 %
  4. Industry Readiness          10 %
  5. Assessment Evidence         10 %
  6. Projects                    10 %
  7. Experience                   8 %
  8. Certifications               5 %
  9. Career Roadmap progress      5 %
 10. Eligibility                  2 %
                         Total: 100 %
"""

import datetime
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger("skillbridge.talent_scoring")

# ---------------------------------------------------------------------------
# Weight configuration (must sum to 1.0)
# ---------------------------------------------------------------------------
WEIGHTS = {
    "role_alignment":     0.15,
    "skill_match":        0.20,
    "skill_proficiency":  0.15,
    "industry_readiness": 0.10,
    "assessment":         0.10,
    "projects":           0.10,
    "experience":         0.08,
    "certifications":     0.05,
    "roadmap_progress":   0.05,
    "eligibility":        0.02,
}

# ---------------------------------------------------------------------------
# Individual factor scorers (each returns 0–100)
# ---------------------------------------------------------------------------

def _score_role_alignment(profile: Dict[str, Any], role_filter: Optional[str]) -> float:
    """Compare student's target role against the company's desired role filter."""
    if not role_filter:
        return 70.0  # neutral score when no filter applied

    target_role = (
        profile.get("careerPreferences", {}).get("targetRole", "")
        or profile.get("targetRole", "")
        or profile.get("personalInfo", {}).get("targetRole", "")
        or ""
    ).strip().lower()

    if not target_role:
        return 20.0  # student hasn't specified a target role

    filter_lower = role_filter.strip().lower()
    # Exact / substring match
    if filter_lower == target_role or filter_lower in target_role or target_role in filter_lower:
        return 100.0

    # Partial word overlap
    filter_words = set(filter_lower.split())
    target_words = set(target_role.split())
    overlap = filter_words & target_words
    if overlap:
        return min(100.0, 40.0 + 30.0 * len(overlap))

    return 25.0


def _score_skill_match(profile: Dict[str, Any], skill_filter: Optional[List[str]]) -> float:
    """Percentage of required skills that the student possesses."""
    if not skill_filter:
        # No filter → score based on how many skills the student has overall
        tech_skills = profile.get("technicalSkills", [])
        count = len(tech_skills) if isinstance(tech_skills, list) else 0
        return min(100.0, count * 12.0)  # cap at 100

    student_skill_names = set()
    for s in profile.get("technicalSkills", []):
        if isinstance(s, dict) and s.get("name"):
            student_skill_names.add(s["name"].strip().lower())

    if not student_skill_names:
        return 0.0

    required = [s.strip().lower() for s in skill_filter if s.strip()]
    if not required:
        return 70.0

    matched = sum(1 for r in required if r in student_skill_names)
    return round((matched / len(required)) * 100, 1)


def _score_skill_proficiency(profile: Dict[str, Any]) -> float:
    """Average proficiency score across all technical skills."""
    skills = profile.get("technicalSkills", [])
    if not skills or not isinstance(skills, list):
        return 0.0

    scores = []
    proficiency_map = {
        "expert": 95, "advanced": 85, "intermediate": 70,
        "beginner": 45, "basic": 40, "novice": 30
    }

    for s in skills:
        if not isinstance(s, dict):
            continue
        # Prefer numeric score
        if s.get("score") and isinstance(s["score"], (int, float)):
            scores.append(float(s["score"]))
        elif s.get("proficiency"):
            prof_str = str(s["proficiency"]).strip().lower()
            scores.append(float(proficiency_map.get(prof_str, 60)))

    return round(sum(scores) / len(scores), 1) if scores else 0.0


def _score_industry_readiness(profile: Dict[str, Any]) -> float:
    """
    Derive industry readiness from profile completeness and explicit field.
    If student has `industryReadiness` stored, use it directly.
    Otherwise compute from profile completeness signals.
    """
    # Use explicit value if present
    explicit = profile.get("industryReadiness")
    if explicit is not None and isinstance(explicit, (int, float)):
        return min(100.0, float(explicit))

    # Compute from profile completeness
    score = 0.0
    if profile.get("personalInfo", {}).get("aboutMe"):
        score += 15.0
    if profile.get("academicInfo", {}).get("college"):
        score += 10.0
    if len(profile.get("technicalSkills", [])) >= 3:
        score += 20.0
    if len(profile.get("projects", [])) >= 1:
        score += 15.0
    if len(profile.get("experiences", []) or profile.get("experience", [])) >= 1:
        score += 15.0
    if len(profile.get("certifications", [])) >= 1:
        score += 10.0
    if profile.get("assessmentDetails", {}).get("testScore"):
        score += 10.0
    if profile.get("careerPreferences", {}).get("targetRole"):
        score += 5.0

    return min(100.0, score)


def _score_assessment(profile: Dict[str, Any]) -> float:
    """Score based on compiler/assessment test performance."""
    details = profile.get("assessmentDetails", {})
    if not details or not isinstance(details, dict):
        return 0.0

    test_score = details.get("testScore")
    if test_score is not None and isinstance(test_score, (int, float)):
        return min(100.0, float(test_score))

    return 0.0


def _score_projects(profile: Dict[str, Any]) -> float:
    """Score based on project count and richness."""
    projects = profile.get("projects", [])
    if not projects or not isinstance(projects, list):
        return 0.0

    base = min(50.0, len(projects) * 20.0)  # Up to 50 for count

    # Richness bonus: description length, technologies count
    richness = 0.0
    for p in projects[:5]:  # cap at 5
        if not isinstance(p, dict):
            continue
        if p.get("description") and len(str(p["description"])) > 30:
            richness += 4.0
        techs = p.get("technologies", [])
        if isinstance(techs, list) and len(techs) >= 2:
            richness += 3.0
        if p.get("githubUrl"):
            richness += 2.0
        if p.get("liveDemoUrl"):
            richness += 1.0

    return min(100.0, base + richness)


def _score_experience(profile: Dict[str, Any]) -> float:
    """Score based on work experience entries."""
    experiences = profile.get("experiences", []) or profile.get("experience", [])
    if not experiences or not isinstance(experiences, list):
        return 0.0

    base = min(60.0, len(experiences) * 25.0)

    detail_bonus = 0.0
    for exp in experiences[:4]:
        if not isinstance(exp, dict):
            continue
        if exp.get("description") and len(str(exp["description"])) > 20:
            detail_bonus += 5.0
        if exp.get("duration"):
            detail_bonus += 3.0
        if exp.get("company") or exp.get("organization"):
            detail_bonus += 2.0

    return min(100.0, base + detail_bonus)


def _score_certifications(profile: Dict[str, Any]) -> float:
    """Score based on certification count."""
    certs = profile.get("certifications", [])
    if not certs or not isinstance(certs, list):
        return 0.0

    count = 0
    for c in certs:
        if isinstance(c, str) and len(c.strip()) > 3:
            count += 1
        elif isinstance(c, dict) and c.get("name"):
            count += 1

    return min(100.0, count * 30.0)


def _score_roadmap_progress(profile: Dict[str, Any]) -> float:
    """Score from explicit roadmap progress field."""
    progress = profile.get("roadmapProgress")
    if progress is not None and isinstance(progress, (int, float)):
        return min(100.0, float(progress))
    return 0.0


def _score_eligibility(profile: Dict[str, Any]) -> float:
    """Basic eligibility: graduation year should be current or upcoming."""
    grad_year_str = profile.get("academicInfo", {}).get("graduationYear", "")
    if not grad_year_str:
        return 50.0  # unknown → neutral

    try:
        grad_year = int(str(grad_year_str).strip()[:4])
    except (ValueError, TypeError):
        return 50.0

    current_year = datetime.datetime.now().year
    if grad_year >= current_year:
        return 100.0  # student is still studying or graduating this year
    elif grad_year == current_year - 1:
        return 80.0   # graduated recently
    else:
        return 50.0   # graduated long ago


# ---------------------------------------------------------------------------
# Main scorer
# ---------------------------------------------------------------------------

def compute_talent_score(
    profile: Dict[str, Any],
    role_filter: Optional[str] = None,
    skill_filter: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Compute a transparent multi-factor talent score for a single student profile.

    Returns a dict with:
      - overall_score: 0-100 weighted total
      - factors: dict of factor_name → { score: 0-100, weight: float, weighted: float }
    """
    factor_scores = {
        "role_alignment":     _score_role_alignment(profile, role_filter),
        "skill_match":        _score_skill_match(profile, skill_filter),
        "skill_proficiency":  _score_skill_proficiency(profile),
        "industry_readiness": _score_industry_readiness(profile),
        "assessment":         _score_assessment(profile),
        "projects":           _score_projects(profile),
        "experience":         _score_experience(profile),
        "certifications":     _score_certifications(profile),
        "roadmap_progress":   _score_roadmap_progress(profile),
        "eligibility":        _score_eligibility(profile),
    }

    factors_detail = {}
    overall = 0.0
    for key, raw_score in factor_scores.items():
        weight = WEIGHTS[key]
        weighted = round(raw_score * weight, 2)
        overall += weighted
        factors_detail[key] = {
            "score": round(raw_score, 1),
            "weight": weight,
            "weighted": round(weighted, 1),
        }

    return {
        "overall_score": round(min(100.0, overall), 1),
        "factors": factors_detail,
    }


# Factor display labels for frontend
FACTOR_LABELS = {
    "role_alignment":     "Target-Role Alignment",
    "skill_match":        "Required-Skill Match",
    "skill_proficiency":  "Skill Proficiency",
    "industry_readiness": "Industry Readiness",
    "assessment":         "Assessment Evidence",
    "projects":           "Projects",
    "experience":         "Experience",
    "certifications":     "Certifications",
    "roadmap_progress":   "Career Roadmap Progress",
    "eligibility":        "Eligibility",
}


def compute_talent_scores_batch(
    profiles: List[Dict[str, Any]],
    role_filter: Optional[str] = None,
    skill_filter: Optional[List[str]] = None,
    opportunity_type: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Score and rank a batch of student profiles.

    Each returned dict contains:
      - uid, name, college, degree, target_role, avatar_url
      - overall_score, factors (per-factor breakdown)
      - skills, projects, experience, certifications, achievements
      - assessment_details, industry_readiness, roadmap_progress
      - is_demo
    """
    results = []
    for prof_data in profiles:
        uid = prof_data.get("uid", "")
        profile = prof_data.get("profile_data", prof_data)

        scoring = compute_talent_score(profile, role_filter, skill_filter)

        personal = profile.get("personalInfo", {})
        academic = profile.get("academicInfo", {})
        career = profile.get("careerPreferences", {})

        result = {
            "uid": uid,
            "name": personal.get("fullName", "Unknown Student"),
            "avatar_url": personal.get("avatarUrl", ""),
            "about_me": personal.get("aboutMe", ""),
            "college": academic.get("institution") or academic.get("college", ""),
            "degree": academic.get("degree", ""),
            "department": academic.get("department", ""),
            "graduation_year": academic.get("graduationYear", ""),
            "cgpa": academic.get("cgpa", ""),
            "target_role": career.get("targetRole", ""),
            "preferred_locations": career.get("preferredLocations", []),
            "work_mode": career.get("workMode", ""),

            "overall_score": scoring["overall_score"],
            "factors": scoring["factors"],

            "technical_skills": profile.get("technicalSkills", []),
            "soft_skills": profile.get("softSkills", []),
            "projects": profile.get("projects", []),
            "experiences": profile.get("experiences", []) or profile.get("experience", []),
            "certifications": profile.get("certifications", []),
            "achievements": profile.get("achievements", []),
            "assessment_details": profile.get("assessmentDetails", {}),
            "industry_readiness": scoring["factors"].get("industry_readiness", {}).get("score", 0),
            "roadmap_progress": profile.get("roadmapProgress", 0),
            "is_demo": profile.get("metadata", {}).get("is_demo", False) if isinstance(profile.get("metadata"), dict) else False,
        }
        results.append(result)

    # Sort by overall_score descending
    results.sort(key=lambda r: r["overall_score"], reverse=True)

    logger.info(
        f"[Talent Scoring] Scored {len(results)} profiles "
        f"(role_filter={role_filter}, skill_filter={skill_filter}, type={opportunity_type}). "
        f"Top score: {results[0]['overall_score'] if results else 'N/A'}"
    )

    return results
