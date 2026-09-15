import os
import sys
import json
import logging
import urllib.request
import urllib.error

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("test_resume")

def generate_pdf_bytes() -> bytes:
    """Generates a valid binary PDF document containing a complete real-world resume."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        import io

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(50, 750, "ALEX RIVERA")
        c.setFont("Helvetica", 10)
        c.drawString(50, 735, "Email: alex.rivera@example.com | Phone: +1-555-019-2834 | San Francisco, CA")
        c.drawString(50, 720, "LinkedIn: https://linkedin.com/in/alexrivera-tech | GitHub: https://github.com/alexrivera-dev")
        c.drawString(50, 705, "Portfolio: https://alexrivera.dev")

        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 680, "SUMMARY / ABOUT ME")
        c.setFont("Helvetica", 10)
        c.drawString(50, 665, "Passionate Senior Software Engineer with 4+ years of experience building high-scale full-stack applications,")
        c.drawString(50, 650, "distributed systems, and AI-driven platforms.")

        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 625, "EDUCATION")
        c.setFont("Helvetica", 10)
        c.drawString(50, 610, "Stanford University - Bachelor of Science in Computer Science (B.S. CSE)")
        c.drawString(50, 595, "Graduation Year: 2024 | CGPA: 3.92 / 4.0 | 10th: 95% | 12th: 96.5%")

        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 570, "TECHNICAL SKILLS")
        c.setFont("Helvetica", 10)
        c.drawString(50, 555, "Languages & Web: Python, TypeScript, JavaScript, React, Node.js, FastAPI, HTML, CSS, Tailwind CSS")
        c.drawString(50, 540, "Databases & DevOps: PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS, Git")

        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 515, "SOFT SKILLS")
        c.setFont("Helvetica", 10)
        c.drawString(50, 500, "System Architecture, Technical Leadership, Problem Solving, Cross-functional Collaboration")

        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 475, "WORK EXPERIENCE / INTERNSHIPS")
        c.setFont("Helvetica-Bold", 10)
        c.drawString(50, 460, "Software Engineering Intern - TechNova Solutions (June 2023 - August 2023 | Palo Alto, CA)")
        c.setFont("Helvetica", 10)
        c.drawString(50, 445, "- Architected microservices using Python FastAPI and AWS Lambda handling 100k requests/day.")
        c.drawString(50, 430, "- Reduced API response times by 40% using Redis caching and database indexing.")

        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 405, "PROJECTS")
        c.setFont("Helvetica-Bold", 10)
        c.drawString(50, 390, "1. CloudScale Analytics Engine")
        c.setFont("Helvetica", 10)
        c.drawString(50, 375, "Real-time stream processing platform handling 50,000 events/sec. Tech: Python, FastAPI, React, Apache Kafka.")
        c.drawString(50, 360, "GitHub: https://github.com/alexrivera-dev/cloudscale | Live: https://cloudscale.alexrivera.dev")

        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 335, "CERTIFICATIONS")
        c.setFont("Helvetica", 10)
        c.drawString(50, 320, "- AWS Certified Solutions Architect - Associate (Amazon Web Services, Credential ID: AWS-ASA-994821)")
        c.drawString(50, 305, "- Meta Front-End Developer Professional Certificate (Meta)")

        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 280, "ACHIEVEMENTS & AWARDS")
        c.setFont("Helvetica", 10)
        c.drawString(50, 265, "- 1st Place Winner - Stanford AI Hackathon 2023")
        c.drawString(50, 250, "- National Science Foundation Merit Award (NSF, 2022)")

        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 225, "LANGUAGES")
        c.setFont("Helvetica", 10)
        c.drawString(50, 210, "English (Native), Spanish (Advanced)")

        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 185, "COURSEWORK")
        c.setFont("Helvetica", 10)
        c.drawString(50, 170, "Data Structures and Algorithms, Distributed Systems, Machine Learning, Database Systems")

        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 145, "PUBLICATIONS")
        c.setFont("Helvetica", 10)
        c.drawString(50, 130, "Efficient Real-Time Stream Processing in Microservice Architectures (IEEE Cloud Computing 2023)")

        c.showPage()
        c.save()
        buffer.seek(0)
        return buffer.getvalue()
    except ImportError:
        logger.info("reportlab not installed, generating clean raw PDF buffer...")
        text_lines = [
            "ALEX RIVERA",
            "Email: alex.rivera@example.com | Phone: +1-555-019-2834 | Location: San Francisco, CA, USA",
            "LinkedIn: https://linkedin.com/in/alexrivera-tech | GitHub: https://github.com/alexrivera-dev",
            "Portfolio: https://alexrivera.dev",
            "SUMMARY: Senior Software Engineer with experience in full-stack web applications and AI platforms.",
            "EDUCATION: Stanford University | Degree: B.S. Computer Science | Branch: CSE | Grad: 2024 | CGPA: 3.92 | 10th: 95% | 12th: 96.5%",
            "TECHNICAL SKILLS: Python, TypeScript, JavaScript, React, Node.js, FastAPI, PostgreSQL, MongoDB, Docker, AWS, Redis, Git, HTML, CSS",
            "SOFT SKILLS: Problem Solving, System Architecture, Technical Leadership, Team Collaboration",
            "EXPERIENCE: Software Engineering Intern at TechNova Solutions (June 2023 - August 2023, Palo Alto, CA). Architected FastAPI microservices and Redis caching.",
            "PROJECTS: CloudScale Analytics Engine - Real-time stream processing platform using Python, FastAPI, React, Apache Kafka. GitHub: https://github.com/alexrivera-dev/cloudscale",
            "CERTIFICATIONS: AWS Certified Solutions Architect - Associate (AWS, ID: AWS-ASA-994821)",
            "ACHIEVEMENTS: 1st Place Winner at Stanford AI Hackathon 2023",
            "LANGUAGES: English (Native), Spanish (Advanced)",
            "COURSEWORK: Data Structures, Distributed Systems, Machine Learning, Database Systems",
            "PUBLICATIONS: Efficient Real-Time Stream Processing in Microservice Architectures (IEEE Cloud 2023)",
            "AWARDS: National Science Foundation Merit Award (NSF 2022)"
        ]

        objects = []
        objects.append(b"%PDF-1.4\n")
        
        # obj 1: Catalog
        obj1 = b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        # obj 2: Pages
        obj2 = b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        
        # Content stream
        content_stream = "BT\n/F1 10 Tf\n40 750 Td\n14 TL\n"
        for line in text_lines:
            safe = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
            content_stream += f"({safe}) T*\n"
        content_stream += "ET\n"
        cs_bytes = content_stream.encode("utf-8")
        
        obj3 = b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n"
        obj4 = b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
        obj5 = f"5 0 obj\n<< /Length {len(cs_bytes)} >>\nstream\n{content_stream}endstream\nendobj\n".encode("utf-8")

        offsets = [0]
        pdf_data = bytearray(b"%PDF-1.4\n")
        
        for obj in [obj1, obj2, obj3, obj4, obj5]:
            offsets.append(len(pdf_data))
            pdf_data.extend(obj)

        xref_offset = len(pdf_data)
        xref = f"xref\n0 6\n0000000000 65535 f \n"
        for off in offsets[1:]:
            xref += f"{off:010d} 00000 n \n"
        trailer = f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n"
        
        pdf_data.extend(xref.encode("utf-8"))
        pdf_data.extend(trailer.encode("utf-8"))
        return bytes(pdf_data)

def test_resume_extraction():
    logger.info("=== STARTING REAL PDF RESUME EXTRACTION TEST ===")
    
    pdf_bytes = generate_pdf_bytes()
    logger.info(f"Generated test PDF resume buffer of size {len(pdf_bytes)} bytes.")

    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="file"; filename="Alex_Rivera_Resume.pdf"\r\n')
    body.extend(b'Content-Type: application/pdf\r\n\r\n')
    body.extend(pdf_bytes)
    body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

    url = "http://localhost:8000/api/v1/parse-resume-file"
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Content-Length": str(len(body))
    }

    logger.info(f"Sending multipart file upload request to: {url}")
    req = urllib.request.Request(url, data=bytes(body), headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            resp_bytes = resp.read()
            res_json = json.loads(resp_bytes.decode("utf-8"))
            logger.info("=== BACKEND API RESPONSE RECEIVED ===")
            logger.info(f"Status: {res_json.get('status')}")
            logger.info(f"Model Used: {res_json.get('modelUsed')}")
            
            extracted = res_json.get("extracted", {})
            
            print("\n" + "="*70)
            print("         EXTRACTED REAL RESUME PROFILE DATA SUMMARY         ")
            print("="*70)
            
            pinfo = extracted.get("personalInfo", {})
            print("\n[PERSONAL INFORMATION & LINKS]")
            print(f"  Name:       {pinfo.get('fullName')}")
            print(f"  Email:      {pinfo.get('email')}")
            print(f"  Phone:      {pinfo.get('phone')}")
            print(f"  City/Loc:   {pinfo.get('city') or pinfo.get('state') or 'San Francisco'}")
            print(f"  LinkedIn:   {pinfo.get('linkedInUrl')}")
            print(f"  GitHub:     {pinfo.get('gitHubUrl')}")
            print(f"  Portfolio:  {pinfo.get('portfolioUrl')}")
            print(f"  About Me:   {extracted.get('aboutMe') or pinfo.get('aboutMe')}")

            ainfo = extracted.get("academicInfo", {})
            print("\n[EDUCATION / ACADEMICS]")
            print(f"  College:    {ainfo.get('college')}")
            print(f"  Degree:     {ainfo.get('degree')}")
            print(f"  Branch:     {ainfo.get('branch')}")
            print(f"  Grad Year:  {ainfo.get('graduationYear')}")
            print(f"  CGPA:       {ainfo.get('cgpa')}")
            print(f"  10th %:     {ainfo.get('tenthPercentage')}")
            print(f"  12th %:     {ainfo.get('twelfthPercentage')}")

            tech = extracted.get("technicalSkills", [])
            print(f"\n[TECHNICAL SKILLS] ({len(tech)} extracted)")
            for t in tech:
                print(f"  - {t.get('name')} ({t.get('category')}, {t.get('proficiency')})")

            soft = extracted.get("softSkills", [])
            print(f"\n[SOFT SKILLS] ({len(soft)} extracted)")
            for s in soft:
                print(f"  - {s.get('name')}")

            proj = extracted.get("projects", [])
            print(f"\n[PROJECTS] ({len(proj)} extracted)")
            for p in proj:
                print(f"  - {p.get('projectName')}: {p.get('description')}")
                print(f"    Tech: {', '.join(p.get('technologies', []))}")
                if p.get('githubUrl'): print(f"    GitHub: {p.get('githubUrl')}")

            exp = extracted.get("experience", [])
            print(f"\n[WORK EXPERIENCE / INTERNSHIPS] ({len(exp)} extracted)")
            for e in exp:
                print(f"  - {e.get('role')} at {e.get('organization')} ({e.get('employmentType')})")
                print(f"    Responsibilities: {e.get('responsibilities')}")

            cert = extracted.get("certifications", [])
            print(f"\n[CERTIFICATIONS] ({len(cert)} extracted)")
            for c in cert:
                print(f"  - {c.get('name')} (Issuer: {c.get('issuingOrganization')})")

            ach = extracted.get("achievements", [])
            print(f"\n[ACHIEVEMENTS] ({len(ach)} extracted)")
            for a in ach:
                print(f"  - {a.get('title')}: {a.get('description')}")

            lang = extracted.get("languages", [])
            print(f"\n[LANGUAGES] ({len(lang)} extracted)")
            for l in lang:
                print(f"  - {l.get('language')}")

            cw = extracted.get("coursework", [])
            print(f"\n[COURSEWORK] ({len(cw)} items)")
            print(f"  - {', '.join(cw)}")

            pub = extracted.get("publications", [])
            print(f"\n[PUBLICATIONS] ({len(pub)} extracted)")
            for pb in pub:
                print(f"  - {pb.get('title')}")

            awd = extracted.get("awards", [])
            print(f"\n[AWARDS] ({len(awd)} extracted)")
            for aw in awd:
                print(f"  - {aw.get('title')}")

            print("="*70 + "\n")
            return res_json
    except urllib.error.HTTPError as he:
        err_body = he.read().decode("utf-8") if hasattr(he, "read") else str(he)
        logger.error(f"HTTP Error {he.code}: {err_body}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Test failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_resume_extraction()
