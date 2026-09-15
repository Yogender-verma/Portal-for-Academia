"""
SkillBridge — Demo Student Profile Seeder

Seeds demo student profiles into PostgreSQL for the SIH prototype.
MUST be run manually: `python backend/seed_demo_students.py`
NEVER auto-seeds during normal application startup.

Usage:
    python backend/seed_demo_students.py           # Seed/update demo profiles
    python backend/seed_demo_students.py --clear    # Remove existing demos, then re-seed

All demo profiles are marked with:
    - is_demo = True  (DB column)
    - metadata.is_demo = True  (JSONB field)
"""

import os
import sys
import logging
import datetime
import argparse
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
from database import StudentProfileModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skillbridge.seed_demo")

DEMO_STUDENTS = [
    {
        "uid": "demo_student_01",
        "personalInfo": {
            "fullName": "Rahul Kumar",
            "location": "New Delhi, India",
            "aboutMe": "Passionate Full Stack Developer with strong expertise in modern React ecosystem, microservices, and PostgreSQL database optimization.",
            "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        },
        "academicInfo": {
            "institution": "Indian Institute of Technology, Delhi",
            "college": "IIT Delhi",
            "degree": "B.Tech",
            "department": "Computer Science",
            "graduationYear": "2025",
            "cgpa": "9.4 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Full Stack Developer",
            "preferredLocations": ["Bengaluru", "Remote", "Gurugram"],
            "workMode": "remote"
        },
        "technicalSkills": [
            {"id": "s1", "name": "React", "proficiency": "Expert", "score": 96},
            {"id": "s2", "name": "TypeScript", "proficiency": "Advanced", "score": 92},
            {"id": "s3", "name": "Node.js", "proficiency": "Advanced", "score": 90},
            {"id": "s4", "name": "PostgreSQL", "proficiency": "Advanced", "score": 88},
            {"id": "s5", "name": "Docker", "proficiency": "Intermediate", "score": 82},
            {"id": "s6", "name": "Tailwind CSS", "proficiency": "Expert", "score": 95}
        ],
        "softSkills": ["Problem Solving", "Team Leadership", "Agile Execution", "Communication"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Real-Time Distributed Collaborative Editor",
                "description": "Architected WebSocket based collaborative text editor with CRDT conflict resolution, Next.js frontend, and Redis pub-sub layer.",
                "technologies": ["React", "TypeScript", "Node.js", "Redis", "WebSockets"],
                "role": "Lead Full-Stack Developer",
                "githubUrl": "https://github.com/rahulkumar/collab-editor",
                "liveDemoUrl": "https://collab.demo.skillbridge.dev"
            },
            {
                "id": "p2",
                "projectName": "High Performance Microservices E-Commerce API",
                "description": "Built containerized REST API handling 5,000 requests/sec with JWT authentication and PostgreSQL connection pooling.",
                "technologies": ["Node.js", "Express", "PostgreSQL", "Docker"],
                "role": "Backend Engineer",
                "githubUrl": "https://github.com/rahulkumar/ecommerce-api"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "ScaleAI Labs",
                "role": "Frontend Engineering Intern",
                "duration": "3 Months (Summer 2024)",
                "description": "Optimized React UI bundle size by 35% and built interactive data dashboard."
            }
        ],
        "certifications": [
            "AWS Certified Developer Associate (2024)",
            "Meta Professional Full Stack Engineer Certificate"
        ],
        "achievements": [
            "SIH 2024 Finalist - National Winner",
            "LeetCode Highest Rating 2150 (Top 1.5%)"
        ],
        "assessmentDetails": {
            "testScore": 95,
            "testCasesPassed": "20 / 20 Passed",
            "executionTimeMs": 24,
            "timeComplexity": "O(N log N)",
            "codeQualityRating": "A+ (Clean Code Compliant)",
            "solvedTopics": ["Data Structures", "Dynamic Programming", "REST API Design"]
        },
        "roadmapProgress": 91,
        "industryReadiness": 96,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_02",
        "personalInfo": {
            "fullName": "Priya Sharma",
            "location": "Bengaluru, India",
            "aboutMe": "Frontend & UI/UX Specialist with deep mastery over React 19, state management, and design systems.",
            "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
        },
        "academicInfo": {
            "institution": "National Institute of Technology, Surathkal",
            "college": "NIT Surathkal",
            "degree": "B.Tech",
            "department": "Computer Science",
            "graduationYear": "2025",
            "cgpa": "9.2 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Frontend Developer",
            "preferredLocations": ["Bengaluru", "Hyderabad"],
            "workMode": "hybrid"
        },
        "technicalSkills": [
            {"id": "s1", "name": "React", "proficiency": "Expert", "score": 98},
            {"id": "s2", "name": "TypeScript", "proficiency": "Expert", "score": 95},
            {"id": "s3", "name": "Tailwind CSS", "proficiency": "Expert", "score": 96},
            {"id": "s4", "name": "Next.js", "proficiency": "Advanced", "score": 90},
            {"id": "s5", "name": "Redux Toolkit", "proficiency": "Advanced", "score": 88}
        ],
        "softSkills": ["UI/UX Eye", "Attention to Detail", "Cross-Functional Collaboration"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Accessible SaaS Component Library",
                "description": "Design system featuring 45+ WCAG 2.1 AA accessible React components with dark mode support.",
                "technologies": ["React", "TypeScript", "Tailwind CSS", "Storybook"],
                "role": "Lead UI Developer",
                "githubUrl": "https://github.com/priyasharma/saas-ui-kit",
                "liveDemoUrl": "https://ui.demo.skillbridge.dev"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "Swiggy Labs",
                "role": "UI Engineering Intern",
                "duration": "6 Months",
                "description": "Built micro-frontend components serving millions of daily visitors."
            }
        ],
        "certifications": ["SkillBridge Verified Frontend Lead"],
        "achievements": ["Design System Contributor on GitHub"],
        "assessmentDetails": {
            "testScore": 96,
            "testCasesPassed": "20 / 20 Passed",
            "executionTimeMs": 18,
            "timeComplexity": "O(N)",
            "codeQualityRating": "A+ Clean",
            "solvedTopics": ["DOM Performance", "Custom React Hooks"]
        },
        "roadmapProgress": 95,
        "industryReadiness": 98,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_03",
        "personalInfo": {
            "fullName": "Aarav Mehta",
            "location": "Mumbai, India",
            "aboutMe": "Backend Systems & Distributed Systems Engineer. Experienced in Python, FastAPI, PostgreSQL, and Redis caching.",
            "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        },
        "academicInfo": {
            "institution": "Indian Institute of Technology, Bombay",
            "college": "IIT Bombay",
            "degree": "B.Tech",
            "department": "Computer Science",
            "graduationYear": "2026",
            "cgpa": "9.6 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Backend Engineer",
            "preferredLocations": ["Remote", "Bengaluru", "Mumbai"],
            "workMode": "remote"
        },
        "technicalSkills": [
            {"id": "s1", "name": "Python", "proficiency": "Expert", "score": 97},
            {"id": "s2", "name": "FastAPI", "proficiency": "Expert", "score": 94},
            {"id": "s3", "name": "PostgreSQL", "proficiency": "Advanced", "score": 92},
            {"id": "s4", "name": "Redis", "proficiency": "Advanced", "score": 89},
            {"id": "s5", "name": "Kafka", "proficiency": "Intermediate", "score": 84}
        ],
        "softSkills": ["System Design", "Algorithmic Thinking", "Code Optimization"],
        "projects": [
            {
                "id": "p1",
                "projectName": "High Throughput Event Streaming Pipeline",
                "description": "Python FastAPI & Apache Kafka pipeline processing 10k messages/sec with automated dead-letter queueing.",
                "technologies": ["Python", "FastAPI", "Kafka", "PostgreSQL", "Docker"],
                "role": "Systems Architect",
                "githubUrl": "https://github.com/aaravmehta/event-stream"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "Razorpay",
                "role": "Backend Intern",
                "duration": "3 Months",
                "description": "Implemented idempotent API rate-limiting middleware using Redis."
            }
        ],
        "certifications": ["Redis Certified Developer (2024)"],
        "achievements": ["ACM ICPC Regional Qualifier 2024"],
        "assessmentDetails": {
            "testScore": 99,
            "testCasesPassed": "20 / 20 Passed",
            "executionTimeMs": 12,
            "timeComplexity": "O(1)",
            "codeQualityRating": "A+ Systems Grade",
            "solvedTopics": ["System Design", "High Concurrency", "Database Indexing"]
        },
        "roadmapProgress": 94,
        "industryReadiness": 96,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_04",
        "personalInfo": {
            "fullName": "Ananya Roy",
            "location": "Hyderabad, India",
            "aboutMe": "Data Scientist & Machine Learning Engineer with research publications in NLP and LLM fine-tuning.",
            "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
        },
        "academicInfo": {
            "institution": "IIIT Hyderabad",
            "college": "IIIT Hyderabad",
            "degree": "B.Tech",
            "department": "AI & ML",
            "graduationYear": "2025",
            "cgpa": "9.5 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Data Scientist",
            "preferredLocations": ["Hyderabad", "Bengaluru", "Remote"],
            "workMode": "hybrid"
        },
        "technicalSkills": [
            {"id": "s1", "name": "Python", "proficiency": "Expert", "score": 98},
            {"id": "s2", "name": "PyTorch", "proficiency": "Advanced", "score": 93},
            {"id": "s3", "name": "SQL", "proficiency": "Advanced", "score": 91},
            {"id": "s4", "name": "Pandas", "proficiency": "Expert", "score": 96},
            {"id": "s5", "name": "Scikit-Learn", "proficiency": "Advanced", "score": 92}
        ],
        "softSkills": ["Statistical Analysis", "Data Visualization", "Research Writing"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Medical Code Summarizer using Fine-Tuned LLaMA-3",
                "description": "Fine-tuned 8B parameter model using LoRA on clinical notes with 89% ROUGE score accuracy.",
                "technologies": ["Python", "PyTorch", "Hugging Face", "Transformers", "SQL"],
                "role": "Lead Researcher & Engineer",
                "githubUrl": "https://github.com/ananyaroy/med-summarizer"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "Adobe Research",
                "role": "AI Research Intern",
                "duration": "6 Months",
                "description": "Co-authored paper on multi-modal document extraction accepted at EMNLP 2024."
            }
        ],
        "certifications": ["Deep Learning Specialization - Coursera"],
        "achievements": ["Kaggle Master - Top 2% in Global Competitions"],
        "assessmentDetails": {
            "testScore": 97,
            "testCasesPassed": "20 / 20 Passed",
            "executionTimeMs": 29,
            "timeComplexity": "O(N log N)",
            "codeQualityRating": "A+ Research Grade",
            "solvedTopics": ["Machine Learning", "Vector Search", "Data Wrangling"]
        },
        "roadmapProgress": 92,
        "industryReadiness": 95,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_05",
        "personalInfo": {
            "fullName": "Vikramaditya Singh",
            "location": "Gurugram, India",
            "aboutMe": "DevOps & Cloud Engineer specializing in Kubernetes, Terraform, and AWS infrastructure automation.",
            "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
        },
        "academicInfo": {
            "institution": "BITS Pilani",
            "college": "BITS Pilani",
            "degree": "B.E.",
            "department": "Computer Science",
            "graduationYear": "2025",
            "cgpa": "9.1 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "DevOps Engineer",
            "preferredLocations": ["Gurugram", "Bengaluru", "Remote"],
            "workMode": "remote"
        },
        "technicalSkills": [
            {"id": "s1", "name": "Docker", "proficiency": "Expert", "score": 96},
            {"id": "s2", "name": "Kubernetes", "proficiency": "Advanced", "score": 91},
            {"id": "s3", "name": "AWS", "proficiency": "Advanced", "score": 90},
            {"id": "s4", "name": "Terraform", "proficiency": "Advanced", "score": 88},
            {"id": "s5", "name": "CI/CD", "proficiency": "Expert", "score": 94}
        ],
        "softSkills": ["Incident Management", "Infrastructure Security", "Automation"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Automated Multi-Cluster Kubernetes Deployment",
                "description": "Terraform & Helm charts for zero-downtime GitOps deployments using ArgoCD.",
                "technologies": ["Kubernetes", "Terraform", "ArgoCD", "AWS", "Helm"],
                "role": "DevOps Architect",
                "githubUrl": "https://github.com/vikramsingh/gitops-k8s"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "Zomato Infra",
                "role": "Cloud Engineering Intern",
                "duration": "4 Months",
                "description": "Reduced monthly AWS cloud spending by $12,000 through automated pod autoscaling."
            }
        ],
        "certifications": ["AWS Certified Solutions Architect Associate (2024)", "CKA - Certified Kubernetes Administrator"],
        "achievements": ["Maintained 99.99% SLA in production deployment lab"],
        "assessmentDetails": {
            "testScore": 94,
            "testCasesPassed": "19 / 20 Passed",
            "executionTimeMs": 35,
            "timeComplexity": "O(N)",
            "codeQualityRating": "A Production Grade",
            "solvedTopics": ["Container Security", "CI/CD Pipelines", "Shell Scripting"]
        },
        "roadmapProgress": 90,
        "industryReadiness": 93,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_06",
        "personalInfo": {
            "fullName": "Meera Iyer",
            "location": "Chennai, India",
            "aboutMe": "Mobile App Developer with expertise in React Native and Flutter. Published 3 apps on Play Store.",
            "avatarUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
        },
        "academicInfo": {
            "institution": "Anna University, Chennai",
            "college": "Anna University",
            "degree": "B.E.",
            "department": "Computer Science",
            "graduationYear": "2026",
            "cgpa": "8.9 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Mobile Developer",
            "preferredLocations": ["Chennai", "Bengaluru", "Remote"],
            "workMode": "hybrid"
        },
        "technicalSkills": [
            {"id": "s1", "name": "React Native", "proficiency": "Expert", "score": 94},
            {"id": "s2", "name": "Flutter", "proficiency": "Advanced", "score": 88},
            {"id": "s3", "name": "TypeScript", "proficiency": "Advanced", "score": 85},
            {"id": "s4", "name": "Firebase", "proficiency": "Advanced", "score": 87},
            {"id": "s5", "name": "GraphQL", "proficiency": "Intermediate", "score": 78}
        ],
        "softSkills": ["Mobile UX Design", "Cross-Platform Thinking", "User Research"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Fitness Tracker with Wearable Integration",
                "description": "React Native app syncing with smartwatches via BLE, real-time step counting and calorie tracking.",
                "technologies": ["React Native", "TypeScript", "Firebase", "BLE"],
                "role": "Lead Mobile Developer",
                "githubUrl": "https://github.com/meeraiyer/fitness-tracker"
            },
            {
                "id": "p2",
                "projectName": "Campus Food Delivery App",
                "description": "Flutter app for college canteens with real-time order tracking, payment integration, and push notifications.",
                "technologies": ["Flutter", "Dart", "Firebase", "Razorpay"],
                "role": "Full Stack Mobile Developer",
                "githubUrl": "https://github.com/meeraiyer/campus-eats"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "PhonePe",
                "role": "Mobile Engineering Intern",
                "duration": "3 Months",
                "description": "Built offline-first transaction history module used by 50M+ users."
            }
        ],
        "certifications": ["Google Associate Android Developer"],
        "achievements": ["3 Published Apps on Google Play Store with 10K+ downloads"],
        "assessmentDetails": {
            "testScore": 88,
            "testCasesPassed": "18 / 20 Passed",
            "executionTimeMs": 32,
            "timeComplexity": "O(N)",
            "codeQualityRating": "A Mobile-First",
            "solvedTopics": ["Mobile Architecture", "State Management", "API Integration"]
        },
        "roadmapProgress": 82,
        "industryReadiness": 87,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_07",
        "personalInfo": {
            "fullName": "Arjun Kapoor",
            "location": "Pune, India",
            "aboutMe": "Cybersecurity enthusiast and ethical hacker. Specializes in penetration testing, SIEM, and network security.",
            "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
        },
        "academicInfo": {
            "institution": "College of Engineering, Pune",
            "college": "COEP Pune",
            "degree": "B.Tech",
            "department": "Computer Science",
            "graduationYear": "2025",
            "cgpa": "8.7 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Security Engineer",
            "preferredLocations": ["Pune", "Mumbai", "Bengaluru"],
            "workMode": "onsite"
        },
        "technicalSkills": [
            {"id": "s1", "name": "Python", "proficiency": "Advanced", "score": 88},
            {"id": "s2", "name": "Network Security", "proficiency": "Expert", "score": 94},
            {"id": "s3", "name": "Penetration Testing", "proficiency": "Advanced", "score": 90},
            {"id": "s4", "name": "Linux", "proficiency": "Expert", "score": 93},
            {"id": "s5", "name": "SIEM Tools", "proficiency": "Intermediate", "score": 80}
        ],
        "softSkills": ["Threat Analysis", "Incident Response", "Documentation"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Automated Vulnerability Scanner",
                "description": "Python-based network scanner detecting OWASP Top 10 vulnerabilities with PDF report generation.",
                "technologies": ["Python", "Nmap", "Burp Suite", "Docker"],
                "role": "Security Researcher",
                "githubUrl": "https://github.com/arjunkapoor/vuln-scanner"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "CrowdStrike India",
                "role": "Security Intern",
                "duration": "3 Months",
                "description": "Conducted penetration tests on client web applications and prepared detailed vulnerability reports."
            }
        ],
        "certifications": ["CompTIA Security+ (2024)", "Certified Ethical Hacker (CEH)"],
        "achievements": ["Bug Bounty Hall of Fame - 3 Companies", "CTF Competition Winner - National Level"],
        "assessmentDetails": {
            "testScore": 86,
            "testCasesPassed": "17 / 20 Passed",
            "executionTimeMs": 45,
            "timeComplexity": "O(N²)",
            "codeQualityRating": "A Security-Focused",
            "solvedTopics": ["Cryptography", "Network Protocols", "Secure Coding"]
        },
        "roadmapProgress": 78,
        "industryReadiness": 85,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_08",
        "personalInfo": {
            "fullName": "Sneha Deshmukh",
            "location": "Bengaluru, India",
            "aboutMe": "UI/UX Designer turned Frontend Engineer. Combines design thinking with clean React code for user-centric products.",
            "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
        },
        "academicInfo": {
            "institution": "RV College of Engineering, Bengaluru",
            "college": "RVCE Bengaluru",
            "degree": "B.E.",
            "department": "Computer Science",
            "graduationYear": "2025",
            "cgpa": "9.0 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Frontend Developer",
            "preferredLocations": ["Bengaluru", "Remote"],
            "workMode": "hybrid"
        },
        "technicalSkills": [
            {"id": "s1", "name": "React", "proficiency": "Expert", "score": 95},
            {"id": "s2", "name": "Figma", "proficiency": "Expert", "score": 97},
            {"id": "s3", "name": "CSS3", "proficiency": "Expert", "score": 94},
            {"id": "s4", "name": "JavaScript", "proficiency": "Advanced", "score": 89},
            {"id": "s5", "name": "Framer Motion", "proficiency": "Advanced", "score": 86}
        ],
        "softSkills": ["Design Thinking", "User Empathy", "Prototyping"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Interactive Portfolio with 3D Elements",
                "description": "Personal portfolio site with Three.js 3D scenes, smooth scroll animations, and dark/light theme toggle.",
                "technologies": ["React", "Three.js", "Framer Motion", "CSS3"],
                "role": "Designer & Developer",
                "githubUrl": "https://github.com/snehadeshmukh/portfolio",
                "liveDemoUrl": "https://sneha.design"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "Flipkart",
                "role": "UI Design Intern",
                "duration": "4 Months",
                "description": "Redesigned product detail page increasing conversion rate by 12%."
            }
        ],
        "certifications": ["Google UX Design Professional Certificate"],
        "achievements": ["Dribbble Featured Designer"],
        "assessmentDetails": {
            "testScore": 91,
            "testCasesPassed": "19 / 20 Passed",
            "executionTimeMs": 22,
            "timeComplexity": "O(N)",
            "codeQualityRating": "A+ UI/UX Grade",
            "solvedTopics": ["Component Architecture", "Responsive Design", "Accessibility"]
        },
        "roadmapProgress": 88,
        "industryReadiness": 92,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_09",
        "personalInfo": {
            "fullName": "Karthik Rajan",
            "location": "Coimbatore, India",
            "aboutMe": "Embedded Systems & IoT engineer passionate about connecting hardware with cloud platforms.",
            "avatarUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150"
        },
        "academicInfo": {
            "institution": "PSG College of Technology, Coimbatore",
            "college": "PSG Tech",
            "degree": "B.E.",
            "department": "ECE",
            "graduationYear": "2025",
            "cgpa": "8.8 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "IoT Engineer",
            "preferredLocations": ["Bengaluru", "Chennai", "Hyderabad"],
            "workMode": "onsite"
        },
        "technicalSkills": [
            {"id": "s1", "name": "C/C++", "proficiency": "Expert", "score": 93},
            {"id": "s2", "name": "Python", "proficiency": "Advanced", "score": 86},
            {"id": "s3", "name": "Arduino", "proficiency": "Expert", "score": 95},
            {"id": "s4", "name": "AWS IoT", "proficiency": "Intermediate", "score": 78},
            {"id": "s5", "name": "MQTT", "proficiency": "Advanced", "score": 85}
        ],
        "softSkills": ["Hardware Debugging", "Technical Documentation", "Prototyping"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Smart Agriculture Monitoring System",
                "description": "IoT system with soil moisture, temperature sensors, and automated irrigation using ESP32 and AWS IoT Core.",
                "technologies": ["C++", "ESP32", "AWS IoT", "MQTT", "Python"],
                "role": "Hardware & Cloud Engineer",
                "githubUrl": "https://github.com/karthikrajan/smart-agri"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "Bosch India",
                "role": "Embedded Systems Intern",
                "duration": "6 Months",
                "description": "Developed firmware for automotive sensor modules using C and AUTOSAR stack."
            }
        ],
        "certifications": ["AWS IoT Core Specialty"],
        "achievements": ["TI Innovation Challenge Winner 2024"],
        "assessmentDetails": {
            "testScore": 82,
            "testCasesPassed": "16 / 20 Passed",
            "executionTimeMs": 50,
            "timeComplexity": "O(N)",
            "codeQualityRating": "A Embedded Grade",
            "solvedTopics": ["Embedded C", "Sensor Integration", "Real-Time Systems"]
        },
        "roadmapProgress": 75,
        "industryReadiness": 80,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_10",
        "personalInfo": {
            "fullName": "Diya Banerjee",
            "location": "Kolkata, India",
            "aboutMe": "AI/ML Engineer focusing on computer vision and generative AI. Published research on diffusion models.",
            "avatarUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
        },
        "academicInfo": {
            "institution": "Jadavpur University",
            "college": "Jadavpur University",
            "degree": "B.E.",
            "department": "Computer Science",
            "graduationYear": "2026",
            "cgpa": "9.3 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "ML Engineer",
            "preferredLocations": ["Bengaluru", "Remote", "Hyderabad"],
            "workMode": "remote"
        },
        "technicalSkills": [
            {"id": "s1", "name": "Python", "proficiency": "Expert", "score": 96},
            {"id": "s2", "name": "TensorFlow", "proficiency": "Advanced", "score": 91},
            {"id": "s3", "name": "PyTorch", "proficiency": "Advanced", "score": 90},
            {"id": "s4", "name": "OpenCV", "proficiency": "Advanced", "score": 88},
            {"id": "s5", "name": "Docker", "proficiency": "Intermediate", "score": 76}
        ],
        "softSkills": ["Research Methodology", "Paper Writing", "Experiment Design"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Real-Time Object Detection for Traffic Safety",
                "description": "YOLOv8-based system detecting pedestrians, vehicles, and traffic signs with 94% mAP on Indian road dataset.",
                "technologies": ["Python", "PyTorch", "OpenCV", "ONNX", "Flask"],
                "role": "ML Lead",
                "githubUrl": "https://github.com/diyabanerjee/traffic-detect"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "Microsoft Research India",
                "role": "Research Intern",
                "duration": "4 Months",
                "description": "Worked on diffusion model architectures for low-resource language image generation."
            }
        ],
        "certifications": ["TensorFlow Developer Certificate (Google)"],
        "achievements": ["Published at CVPR Workshop 2024", "Kaggle Notebooks Expert"],
        "assessmentDetails": {
            "testScore": 93,
            "testCasesPassed": "19 / 20 Passed",
            "executionTimeMs": 28,
            "timeComplexity": "O(N log N)",
            "codeQualityRating": "A+ ML Pipeline",
            "solvedTopics": ["Neural Networks", "Model Optimization", "Data Pipelines"]
        },
        "roadmapProgress": 87,
        "industryReadiness": 91,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_11",
        "personalInfo": {
            "fullName": "Sahil Patel",
            "location": "Ahmedabad, India",
            "aboutMe": "Full Stack Java developer with Spring Boot expertise. Built enterprise-grade applications for banking domain.",
            "avatarUrl": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150"
        },
        "academicInfo": {
            "institution": "Nirma University, Ahmedabad",
            "college": "Nirma University",
            "degree": "B.Tech",
            "department": "Computer Science",
            "graduationYear": "2025",
            "cgpa": "8.6 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Backend Developer",
            "preferredLocations": ["Ahmedabad", "Pune", "Bengaluru"],
            "workMode": "onsite"
        },
        "technicalSkills": [
            {"id": "s1", "name": "Java", "proficiency": "Expert", "score": 94},
            {"id": "s2", "name": "Spring Boot", "proficiency": "Advanced", "score": 91},
            {"id": "s3", "name": "MySQL", "proficiency": "Advanced", "score": 87},
            {"id": "s4", "name": "React", "proficiency": "Intermediate", "score": 75},
            {"id": "s5", "name": "Microservices", "proficiency": "Advanced", "score": 86}
        ],
        "softSkills": ["Clean Architecture", "Test-Driven Development", "Code Review"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Banking Transaction Ledger System",
                "description": "Spring Boot microservices handling ACID-compliant transactions with audit logging and role-based access.",
                "technologies": ["Java", "Spring Boot", "MySQL", "RabbitMQ", "Docker"],
                "role": "Backend Lead",
                "githubUrl": "https://github.com/sahilpatel/banking-ledger"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "TCS Digital",
                "role": "Software Engineering Intern",
                "duration": "6 Months",
                "description": "Developed REST APIs for insurance claims processing system."
            }
        ],
        "certifications": ["Oracle Certified Java SE 17 Developer"],
        "achievements": ["HackTCS National Finalist 2024"],
        "assessmentDetails": {
            "testScore": 89,
            "testCasesPassed": "18 / 20 Passed",
            "executionTimeMs": 38,
            "timeComplexity": "O(N log N)",
            "codeQualityRating": "A Enterprise Grade",
            "solvedTopics": ["OOP Design Patterns", "Database Design", "API Security"]
        },
        "roadmapProgress": 80,
        "industryReadiness": 84,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_12",
        "personalInfo": {
            "fullName": "Ishani Gupta",
            "location": "Jaipur, India",
            "aboutMe": "Cloud-native developer passionate about serverless architectures, Golang, and distributed databases.",
            "avatarUrl": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150"
        },
        "academicInfo": {
            "institution": "LNMIIT Jaipur",
            "college": "LNMIIT Jaipur",
            "degree": "B.Tech",
            "department": "Computer Science",
            "graduationYear": "2026",
            "cgpa": "9.0 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Cloud Engineer",
            "preferredLocations": ["Remote", "Bengaluru", "Hyderabad"],
            "workMode": "remote"
        },
        "technicalSkills": [
            {"id": "s1", "name": "Go", "proficiency": "Advanced", "score": 89},
            {"id": "s2", "name": "AWS Lambda", "proficiency": "Advanced", "score": 87},
            {"id": "s3", "name": "Docker", "proficiency": "Advanced", "score": 88},
            {"id": "s4", "name": "Terraform", "proficiency": "Intermediate", "score": 79},
            {"id": "s5", "name": "Python", "proficiency": "Advanced", "score": 85}
        ],
        "softSkills": ["Cloud Architecture", "Cost Optimization", "Technical Writing"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Serverless URL Shortener at Scale",
                "description": "AWS Lambda + DynamoDB URL shortener handling 100K redirects/day with CloudFront CDN and custom analytics.",
                "technologies": ["Go", "AWS Lambda", "DynamoDB", "CloudFront", "Terraform"],
                "role": "Cloud Developer",
                "githubUrl": "https://github.com/ishanigupta/url-shortener"
            }
        ],
        "experiences": [],
        "certifications": ["AWS Certified Cloud Practitioner"],
        "achievements": ["AWS Community Builder 2024"],
        "assessmentDetails": {
            "testScore": 85,
            "testCasesPassed": "17 / 20 Passed",
            "executionTimeMs": 30,
            "timeComplexity": "O(1)",
            "codeQualityRating": "A Cloud-Native",
            "solvedTopics": ["Serverless Patterns", "NoSQL Design", "Infrastructure as Code"]
        },
        "roadmapProgress": 72,
        "industryReadiness": 79,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_13",
        "personalInfo": {
            "fullName": "Tanisha Malhotra",
            "location": "Chandigarh, India",
            "aboutMe": "Blockchain developer and Web3 enthusiast. Built DeFi protocols and smart contracts on Ethereum and Solana.",
            "avatarUrl": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150"
        },
        "academicInfo": {
            "institution": "PEC Chandigarh",
            "college": "PEC Chandigarh",
            "degree": "B.Tech",
            "department": "Computer Science",
            "graduationYear": "2025",
            "cgpa": "8.5 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Blockchain Developer",
            "preferredLocations": ["Remote", "Bengaluru"],
            "workMode": "remote"
        },
        "technicalSkills": [
            {"id": "s1", "name": "Solidity", "proficiency": "Expert", "score": 92},
            {"id": "s2", "name": "Rust", "proficiency": "Intermediate", "score": 75},
            {"id": "s3", "name": "JavaScript", "proficiency": "Advanced", "score": 87},
            {"id": "s4", "name": "React", "proficiency": "Advanced", "score": 84},
            {"id": "s5", "name": "Ethers.js", "proficiency": "Advanced", "score": 89}
        ],
        "softSkills": ["Smart Contract Auditing", "Tokenomics", "Community Building"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Decentralized Lending Protocol",
                "description": "Solidity-based lending pool with dynamic interest rates, flash loan support, and governance token.",
                "technologies": ["Solidity", "Hardhat", "React", "Ethers.js", "IPFS"],
                "role": "Smart Contract Developer",
                "githubUrl": "https://github.com/tanishamalhotra/defi-lend"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "Polygon Labs",
                "role": "Web3 Intern",
                "duration": "3 Months",
                "description": "Developed cross-chain bridge UI and smart contract integration tests."
            }
        ],
        "certifications": ["Ethereum Developer Certification"],
        "achievements": ["ETHIndia Hackathon Winner 2024"],
        "assessmentDetails": {
            "testScore": 84,
            "testCasesPassed": "17 / 20 Passed",
            "executionTimeMs": 40,
            "timeComplexity": "O(N)",
            "codeQualityRating": "A Web3 Grade",
            "solvedTopics": ["Smart Contracts", "Merkle Trees", "Cryptographic Hashing"]
        },
        "roadmapProgress": 76,
        "industryReadiness": 82,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_14",
        "personalInfo": {
            "fullName": "Rohan Verma",
            "location": "Lucknow, India",
            "aboutMe": "Game developer and graphics programmer. Building immersive experiences with Unity and Unreal Engine.",
            "avatarUrl": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150"
        },
        "academicInfo": {
            "institution": "IIT BHU Varanasi",
            "college": "IIT BHU",
            "degree": "B.Tech",
            "department": "Computer Science",
            "graduationYear": "2026",
            "cgpa": "8.4 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Game Developer",
            "preferredLocations": ["Bengaluru", "Pune", "Remote"],
            "workMode": "hybrid"
        },
        "technicalSkills": [
            {"id": "s1", "name": "C#", "proficiency": "Expert", "score": 93},
            {"id": "s2", "name": "Unity", "proficiency": "Expert", "score": 95},
            {"id": "s3", "name": "C++", "proficiency": "Advanced", "score": 87},
            {"id": "s4", "name": "Unreal Engine", "proficiency": "Intermediate", "score": 78},
            {"id": "s5", "name": "Blender", "proficiency": "Intermediate", "score": 74}
        ],
        "softSkills": ["Creative Problem Solving", "3D Mathematics", "Team Collaboration"],
        "projects": [
            {
                "id": "p1",
                "projectName": "Multiplayer Space Battle Arena",
                "description": "Unity multiplayer game with Photon networking, procedural level generation, and leaderboard system.",
                "technologies": ["Unity", "C#", "Photon", "Firebase"],
                "role": "Lead Game Developer",
                "githubUrl": "https://github.com/rohanverma/space-arena"
            }
        ],
        "experiences": [],
        "certifications": ["Unity Certified Developer"],
        "achievements": ["Global Game Jam Participant - 3 Years", "Itch.io Featured Game"],
        "assessmentDetails": {
            "testScore": 80,
            "testCasesPassed": "16 / 20 Passed",
            "executionTimeMs": 55,
            "timeComplexity": "O(N²)",
            "codeQualityRating": "A Game-Dev Grade",
            "solvedTopics": ["Algorithms", "Graph Traversal", "Real-Time Systems"]
        },
        "roadmapProgress": 70,
        "industryReadiness": 76,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_15",
        "personalInfo": {
            "fullName": "Nandini Krishnan",
            "location": "Thiruvananthapuram, India",
            "aboutMe": "Full Stack developer with MERN stack mastery. Passionate about building SaaS products and developer tools.",
            "avatarUrl": "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=150"
        },
        "academicInfo": {
            "institution": "National Institute of Technology, Calicut",
            "college": "NIT Calicut",
            "degree": "B.Tech",
            "department": "Computer Science",
            "graduationYear": "2025",
            "cgpa": "9.1 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Full Stack Developer",
            "preferredLocations": ["Bengaluru", "Remote", "Hyderabad"],
            "workMode": "remote"
        },
        "technicalSkills": [
            {"id": "s1", "name": "React", "proficiency": "Expert", "score": 94},
            {"id": "s2", "name": "Node.js", "proficiency": "Expert", "score": 93},
            {"id": "s3", "name": "MongoDB", "proficiency": "Advanced", "score": 88},
            {"id": "s4", "name": "TypeScript", "proficiency": "Advanced", "score": 90},
            {"id": "s5", "name": "Redis", "proficiency": "Intermediate", "score": 79},
            {"id": "s6", "name": "Next.js", "proficiency": "Advanced", "score": 87}
        ],
        "softSkills": ["Product Thinking", "Rapid Prototyping", "Technical Mentorship"],
        "projects": [
            {
                "id": "p1",
                "projectName": "SaaS Project Management Tool",
                "description": "Full-featured Trello alternative with real-time collaboration, Kanban boards, Gantt charts, and team analytics.",
                "technologies": ["React", "Node.js", "MongoDB", "Socket.io", "Redis"],
                "role": "Founder & Full Stack Developer",
                "githubUrl": "https://github.com/nandinikrishnan/task-flow",
                "liveDemoUrl": "https://taskflow.demo.dev"
            },
            {
                "id": "p2",
                "projectName": "Developer Productivity CLI Tool",
                "description": "Node.js CLI that scaffolds project templates, generates boilerplate code, and manages Git workflows.",
                "technologies": ["Node.js", "TypeScript", "Commander.js"],
                "role": "Open Source Author",
                "githubUrl": "https://github.com/nandinikrishnan/dev-cli"
            }
        ],
        "experiences": [
            {
                "id": "e1",
                "company": "Freshworks",
                "role": "Full Stack Engineering Intern",
                "duration": "6 Months",
                "description": "Built micro-frontend architecture for customer support dashboard module."
            }
        ],
        "certifications": ["MongoDB Certified Developer", "Meta Frontend Developer Professional Certificate"],
        "achievements": ["Open Source Contributor - 500+ GitHub Stars", "SIH 2024 Finalist"],
        "assessmentDetails": {
            "testScore": 94,
            "testCasesPassed": "19 / 20 Passed",
            "executionTimeMs": 20,
            "timeComplexity": "O(N log N)",
            "codeQualityRating": "A+ Clean Code",
            "solvedTopics": ["Full Stack Architecture", "Real-Time Systems", "API Design"]
        },
        "roadmapProgress": 89,
        "industryReadiness": 93,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_16",
        "personalInfo": {
            "fullName": "Kavya Venkat",
            "location": "Chennai, India",
            "aboutMe": "ECE Specialist focused on VLSI design, FPGA prototyping, and high-speed digital circuit design.",
            "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
        },
        "academicInfo": {
            "institution": "National Institute of Technology, Trichy",
            "college": "NIT Trichy",
            "degree": "B.Tech",
            "department": "ECE",
            "graduationYear": "2025",
            "cgpa": "9.4 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "VLSI & Embedded Systems Specialist",
            "preferredLocations": ["Bengaluru", "Chennai", "Hyderabad"],
            "workMode": "onsite"
        },
        "technicalSkills": [
            {"id": "s16_1", "name": "FPGA Design", "proficiency": "Expert", "score": 96},
            {"id": "s16_2", "name": "Verilog", "proficiency": "Expert", "score": 92},
            {"id": "s16_3", "name": "SystemVerilog", "proficiency": "Advanced", "score": 90},
            {"id": "s16_4", "name": "Embedded C", "proficiency": "Advanced", "score": 88},
            {"id": "s16_5", "name": "ARM Cortex", "proficiency": "Advanced", "score": 85},
            {"id": "s16_6", "name": "KiCAD", "proficiency": "Intermediate", "score": 82}
        ],
        "softSkills": ["Hardware Debugging", "Digital Design", "Signal Integrity", "Teamwork"],
        "projects": [
            {
                "id": "p16_1",
                "projectName": "RISC-V 32-bit Core Processor on Xilinx FPGA",
                "description": "Designed 5-stage pipelined RISC-V RV32I core in Verilog HDL with hazard detection and branch prediction.",
                "technologies": ["Verilog", "Xilinx Vivado", "FPGA", "RISC-V", "ModelSim"],
                "role": "Lead Hardware Architect",
                "githubUrl": "https://github.com/kavyavenkat/riscv-fpga-core"
            },
            {
                "id": "p16_2",
                "projectName": "IoT Smart Industrial Environmental Gateway",
                "description": "Custom PCB design for ARM Cortex-M4 microcontroller handling RS485 Modbus telemetry to cloud.",
                "technologies": ["Embedded C", "ARM Cortex", "KiCAD", "MQTT"],
                "role": "PCB & Firmware Developer",
                "githubUrl": "https://github.com/kavyavenkat/industrial-gateway"
            }
        ],
        "experiences": [
            {
                "id": "e16_1",
                "company": "Intel India",
                "role": "Silicon Validation Intern",
                "duration": "6 Months",
                "description": "Ran automated RTL test benches for post-silicon validation on 14nm test chips."
            }
        ],
        "certifications": ["Cadence Virtuoso VLSI Certified", "Arm Accredited Engineer"],
        "achievements": ["1st Place - National Microelectronics Design Hackathon 2024"],
        "assessmentDetails": {
            "testScore": 95,
            "testCasesPassed": "20 / 20 Passed",
            "executionTimeMs": 19,
            "timeComplexity": "O(1)",
            "codeQualityRating": "A+ Hardware Grade",
            "solvedTopics": ["Digital Logic", "RTL Verification", "Embedded Systems"]
        },
        "roadmapProgress": 93,
        "industryReadiness": 96,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_17",
        "personalInfo": {
            "fullName": "Aditya Kulkarni",
            "location": "Bengaluru, India",
            "aboutMe": "Computer Vision & Edge-AI Engineer passionate about real-time object detection and TensorRT deployment.",
            "avatarUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150"
        },
        "academicInfo": {
            "institution": "International Institute of Information Technology, Bangalore",
            "college": "IIIT Bangalore",
            "degree": "B.Tech",
            "department": "AI & ML",
            "graduationYear": "2025",
            "cgpa": "9.3 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Computer Vision Engineer",
            "preferredLocations": ["Bengaluru", "Remote", "Hyderabad"],
            "workMode": "hybrid"
        },
        "technicalSkills": [
            {"id": "s17_1", "name": "PyTorch", "proficiency": "Expert", "score": 96},
            {"id": "s17_2", "name": "OpenCV", "proficiency": "Expert", "score": 94},
            {"id": "s17_3", "name": "TensorRT", "proficiency": "Advanced", "score": 91},
            {"id": "s17_4", "name": "YOLOv9", "proficiency": "Advanced", "score": 90},
            {"id": "s17_5", "name": "Python", "proficiency": "Expert", "score": 95},
            {"id": "s17_6", "name": "CUDA", "proficiency": "Intermediate", "score": 86}
        ],
        "softSkills": ["Model Optimization", "Deep Learning Research", "Mathematical Modeling"],
        "projects": [
            {
                "id": "p17_1",
                "projectName": "Edge-AI Driver Drowsiness Detection System",
                "description": "Deployed YOLOv9 + facial landmark analysis model on NVIDIA Jetson Orin with 60 FPS real-time throughput.",
                "technologies": ["PyTorch", "TensorRT", "OpenCV", "CUDA", "Python"],
                "role": "Lead Computer Vision Developer",
                "githubUrl": "https://github.com/adityakulkarni/drowsiness-edge-ai"
            }
        ],
        "experiences": [
            {
                "id": "e17_1",
                "company": "NVIDIA Graphics India",
                "role": "Deep Learning Intern",
                "duration": "5 Months",
                "description": "Optimized FP16 quantization pipelines for autonomous vehicle object detection models."
            }
        ],
        "certifications": ["NVIDIA Deep Learning Institute (DLI) Ambassador Certificate"],
        "achievements": ["Kaggle Master - Rank #42 in Global Vision Competition"],
        "assessmentDetails": {
            "testScore": 96,
            "testCasesPassed": "20 / 20 Passed",
            "executionTimeMs": 21,
            "timeComplexity": "O(N log N)",
            "codeQualityRating": "A+ Vision Grade",
            "solvedTopics": ["Neural Network Quantization", "CUDA Optimization", "Matrix Operations"]
        },
        "roadmapProgress": 91,
        "industryReadiness": 95,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_18",
        "personalInfo": {
            "fullName": "Riya Sundaram",
            "location": "Hyderabad, India",
            "aboutMe": "Data Scientist skilled in predictive modeling, Snowflake cloud warehousing, and interactive analytics dashboards.",
            "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
        },
        "academicInfo": {
            "institution": "BITS Pilani, Goa Campus",
            "college": "BITS Pilani",
            "degree": "B.E.",
            "department": "DS",
            "graduationYear": "2025",
            "cgpa": "9.2 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Data Scientist & Analytics Lead",
            "preferredLocations": ["Hyderabad", "Bengaluru", "Remote"],
            "workMode": "remote"
        },
        "technicalSkills": [
            {"id": "s18_1", "name": "Python", "proficiency": "Expert", "score": 96},
            {"id": "s18_2", "name": "SQL", "proficiency": "Expert", "score": 94},
            {"id": "s18_3", "name": "Tableau", "proficiency": "Advanced", "score": 92},
            {"id": "s18_4", "name": "Snowflake", "proficiency": "Advanced", "score": 88},
            {"id": "s18_5", "name": "Scikit-Learn", "proficiency": "Advanced", "score": 91},
            {"id": "s18_6", "name": "PowerBI", "proficiency": "Advanced", "score": 87}
        ],
        "softSkills": ["Statistical Inference", "Business Analytics", "Executive Storytelling"],
        "projects": [
            {
                "id": "p18_1",
                "projectName": "Predictive Customer Churn & Lifetime Value Engine",
                "description": "Ensemble ML model predicting subscription churn with 92% precision integrated into Snowflake & Tableau dashboards.",
                "technologies": ["Python", "Scikit-Learn", "Snowflake", "SQL", "Tableau"],
                "role": "Principal Data Scientist",
                "githubUrl": "https://github.com/riyasundaram/churn-prediction-engine"
            }
        ],
        "experiences": [
            {
                "id": "e18_1",
                "company": "Mu Sigma",
                "role": "Decision Sciences Intern",
                "duration": "4 Months",
                "description": "Formulated statistical market mix models for Fortune 500 retail client."
            }
        ],
        "certifications": ["Snowflake SnowPro Core Certified", "Tableau Desktop Specialist"],
        "achievements": ["National Winner - Analytics Vidhya Hackathon 2024"],
        "assessmentDetails": {
            "testScore": 94,
            "testCasesPassed": "19 / 20 Passed",
            "executionTimeMs": 23,
            "timeComplexity": "O(N log N)",
            "codeQualityRating": "A+ Analytics Grade",
            "solvedTopics": ["Hypothesis Testing", "Regression Models", "Data Pipeline ETL"]
        },
        "roadmapProgress": 90,
        "industryReadiness": 94,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_19",
        "personalInfo": {
            "fullName": "Pranav Pillai",
            "location": "Kochi, India",
            "aboutMe": "Embedded Firmware Engineer specializing in FreeRTOS, CAN-Bus protocols, and autonomous robotics control.",
            "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
        },
        "academicInfo": {
            "institution": "College of Engineering, Trivandrum",
            "college": "CET Trivandrum",
            "degree": "B.Tech",
            "department": "ECE",
            "graduationYear": "2026",
            "cgpa": "8.9 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Robotics & Embedded Firmware Engineer",
            "preferredLocations": ["Bengaluru", "Kochi", "Pune"],
            "workMode": "onsite"
        },
        "technicalSkills": [
            {"id": "s19_1", "name": "Embedded C++", "proficiency": "Expert", "score": 93},
            {"id": "s19_2", "name": "FreeRTOS", "proficiency": "Advanced", "score": 90},
            {"id": "s19_3", "name": "ROS2", "proficiency": "Advanced", "score": 88},
            {"id": "s19_4", "name": "MATLAB", "proficiency": "Advanced", "score": 86},
            {"id": "s19_5", "name": "Microcontrollers", "proficiency": "Expert", "score": 92},
            {"id": "s19_6", "name": "CAN Bus", "proficiency": "Advanced", "score": 84}
        ],
        "softSkills": ["Real-Time Systems", "Hardware Troubleshooting", "Control Theory"],
        "projects": [
            {
                "id": "p19_1",
                "projectName": "Autonomous LiDAR Drone Navigation System",
                "description": "ROS2 and FreeRTOS control stack for quadcopter obstacle avoidance using 2D LiDAR sensor fusion.",
                "technologies": ["Embedded C++", "FreeRTOS", "ROS2", "LiDAR", "STM32"],
                "role": "Firmware & Robotics Lead",
                "githubUrl": "https://github.com/pranavpillai/autonomous-drone-ros2"
            }
        ],
        "experiences": [
            {
                "id": "e19_1",
                "company": "Tata Elxsi",
                "role": "Embedded Systems Intern",
                "duration": "3 Months",
                "description": "Built CAN-Bus sensor telemetry module for electric vehicle battery management system."
            }
        ],
        "certifications": ["Certified ROS2 Developer", "STM32 Microcontroller Certification"],
        "achievements": ["e-Yantra Robotics Competition Winner - IIT Bombay"],
        "assessmentDetails": {
            "testScore": 89,
            "testCasesPassed": "18 / 20 Passed",
            "executionTimeMs": 31,
            "timeComplexity": "O(N)",
            "codeQualityRating": "A Firmware Grade",
            "solvedTopics": ["Task Scheduling", "Interrupt Handlers", "Sensor Fusion"]
        },
        "roadmapProgress": 84,
        "industryReadiness": 88,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_20",
        "personalInfo": {
            "fullName": "Tanvi Joshi",
            "location": "New Delhi, India",
            "aboutMe": "AI Engineer focused on Large Language Models, RAG pipelines, and LangChain vector search architectures.",
            "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        },
        "academicInfo": {
            "institution": "Delhi Technological University",
            "college": "DTU Delhi",
            "degree": "B.Tech",
            "department": "AI & ML",
            "graduationYear": "2025",
            "cgpa": "9.5 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "NLP & LLM Systems Engineer",
            "preferredLocations": ["Gurugram", "Bengaluru", "Remote"],
            "workMode": "remote"
        },
        "technicalSkills": [
            {"id": "s20_1", "name": "Python", "proficiency": "Expert", "score": 97},
            {"id": "s20_2", "name": "Hugging Face", "proficiency": "Expert", "score": 95},
            {"id": "s20_3", "name": "LangChain", "proficiency": "Expert", "score": 92},
            {"id": "s20_4", "name": "Vector Databases", "proficiency": "Advanced", "score": 90},
            {"id": "s20_5", "name": "ChromaDB", "proficiency": "Advanced", "score": 88},
            {"id": "s20_6", "name": "PyTorch", "proficiency": "Advanced", "score": 91}
        ],
        "softSkills": ["Prompt Engineering", "Semantic Search", "LLM Evaluation", "Ethics in AI"],
        "projects": [
            {
                "id": "p20_1",
                "projectName": "RAG-Powered Autonomous Code & Security Reviewer",
                "description": "LangChain and Qdrant vector search system analyzing repository commits against OWASP guidelines with multi-step reasoning.",
                "technologies": ["Python", "LangChain", "Hugging Face", "ChromaDB", "FastAPI"],
                "role": "Lead AI Architect",
                "githubUrl": "https://github.com/tanvijoshi/rag-code-reviewer"
            }
        ],
        "experiences": [
            {
                "id": "e20_1",
                "company": "Cohere AI",
                "role": "NLP Research Fellow",
                "duration": "6 Months",
                "description": "Co-developed open-source evaluation suite for multilingual retriever models."
            }
        ],
        "certifications": ["LangChain Certified Developer", "Hugging Face Open Source Contributor"],
        "achievements": ["AI Grant Finalist 2024", "Top 100 Women in AI India"],
        "assessmentDetails": {
            "testScore": 98,
            "testCasesPassed": "20 / 20 Passed",
            "executionTimeMs": 15,
            "timeComplexity": "O(N log N)",
            "codeQualityRating": "A+ LLM Grade",
            "solvedTopics": ["Vector Embeddings", "Retrieval Augmented Generation", "NLP Models"]
        },
        "roadmapProgress": 94,
        "industryReadiness": 97,
        "metadata": {"is_demo": True}
    },
    {
        "uid": "demo_student_21",
        "personalInfo": {
            "fullName": "Abhinav Dhar",
            "location": "Kolkata, India",
            "aboutMe": "Big Data Engineer skilled in PySpark, Kafka event streaming, and distributed graph analytics.",
            "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
        },
        "academicInfo": {
            "institution": "Indian Institute of Technology, Kharagpur",
            "college": "IIT Kharagpur",
            "degree": "B.Tech",
            "department": "DS",
            "graduationYear": "2025",
            "cgpa": "9.3 / 10.0"
        },
        "careerPreferences": {
            "targetRole": "Big Data & Machine Learning Engineer",
            "preferredLocations": ["Kolkata", "Bengaluru", "Remote"],
            "workMode": "hybrid"
        },
        "technicalSkills": [
            {"id": "s21_1", "name": "Apache Spark", "proficiency": "Expert", "score": 95},
            {"id": "s21_2", "name": "PySpark", "proficiency": "Expert", "score": 93},
            {"id": "s21_3", "name": "Python", "proficiency": "Expert", "score": 96},
            {"id": "s21_4", "name": "PostgreSQL", "proficiency": "Advanced", "score": 90},
            {"id": "s21_5", "name": "Kafka", "proficiency": "Advanced", "score": 88},
            {"id": "s21_6", "name": "MLflow", "proficiency": "Advanced", "score": 87}
        ],
        "softSkills": ["Distributed Computing", "Query Tuning", "Data Pipeline Reliability"],
        "projects": [
            {
                "id": "p21_1",
                "projectName": "Real-Time Financial Fraud Detection Engine",
                "description": "Apache Kafka + PySpark streaming system processing 50,000 transactions/sec with graph anomaly detection.",
                "technologies": ["Apache Spark", "PySpark", "Kafka", "PostgreSQL", "Docker"],
                "role": "Lead Data Systems Engineer",
                "githubUrl": "https://github.com/abhinavdhar/spark-fraud-stream"
            }
        ],
        "experiences": [
            {
                "id": "e21_1",
                "company": "Databricks India",
                "role": "Big Data Engineering Intern",
                "duration": "4 Months",
                "description": "Optimized Delta Lake auto-compacting jobs reducing storage latency by 40%."
            }
        ],
        "certifications": ["Databricks Certified Associate Developer for Apache Spark"],
        "achievements": ["Apache Spark Contributor", "HackKharagpur Winner 2024"],
        "assessmentDetails": {
            "testScore": 95,
            "testCasesPassed": "20 / 20 Passed",
            "executionTimeMs": 17,
            "timeComplexity": "O(N log N)",
            "codeQualityRating": "A+ Distributed Systems Grade",
            "solvedTopics": ["MapReduce", "Spark Streaming", "Graph Theory"]
        },
        "roadmapProgress": 92,
        "industryReadiness": 95,
        "metadata": {"is_demo": True}
    },
]


def clear_demo_students():
    """Remove ONLY demo student profiles (is_demo=True) from PostgreSQL."""
    database.init_db()
    db: Session = database.SessionLocal()
    try:
        deleted = db.query(StudentProfileModel).filter(
            StudentProfileModel.is_demo == True
        ).delete(synchronize_session=False)
        db.commit()
        logger.info(f"Cleared {deleted} existing demo student profiles (is_demo=True). Real student profiles preserved.")
        print(f"[OK] Cleared {deleted} existing demo student profiles from PostgreSQL 'skillbridge_db'.")
        print(f"     -> All real student profiles (is_demo=False) remain intact.")
        return deleted
    except Exception as e:
        db.rollback()
        logger.error(f"Error clearing demo students: {e}")
        print(f"[ERROR] Failed to clear demo students: {e}")
        return 0
    finally:
        db.close()


def seed_demo_students(clear_first: bool = False, clear_only: bool = False):
    """Seed demo students into PostgreSQL. Must be run manually."""
    if clear_only:
        clear_demo_students()
        return

    if clear_first:
        clear_demo_students()

    database.init_db()
    db: Session = database.SessionLocal()
    try:
        count_new = 0
        count_updated = 0
        for student_data in DEMO_STUDENTS:
            uid = student_data["uid"]
            existing = db.query(StudentProfileModel).filter(StudentProfileModel.uid == uid).first()
            if not existing:
                profile = StudentProfileModel(
                    uid=uid,
                    profile_data=student_data,
                    is_demo=True,
                    updated_at=datetime.datetime.now()
                )
                db.add(profile)
                count_new += 1
            elif existing.is_demo:
                existing.profile_data = student_data
                existing.is_demo = True
                existing.updated_at = datetime.datetime.now()
                count_updated += 1
            else:
                logger.warning(f"Skipping seeding for UID '{uid}' because it belongs to a real student (is_demo=False).")
        db.commit()
        logger.info(f"Seeded {count_new} new + {count_updated} updated demo profiles.")
        print(f"[OK] Seeded {len(DEMO_STUDENTS)} demo student profiles into PostgreSQL 'skillbridge_db'.")
        print(f"     -> {count_new} new, {count_updated} updated")
        print(f"     -> All marked with is_demo=True")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding demo students: {e}")
        print(f"[ERROR] Failed to seed demo students: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed or clear demo student profiles in PostgreSQL")
    parser.add_argument("--clear", action="store_true", help="Delete ONLY demo profiles (is_demo=True) for production readiness")
    parser.add_argument("--reseed", action="store_true", help="Remove existing demo students and re-seed fresh demo profiles")
    args = parser.parse_args()

    if args.reseed:
        seed_demo_students(clear_first=True, clear_only=False)
    elif args.clear:
        seed_demo_students(clear_only=True)
    else:
        seed_demo_students(clear_first=False, clear_only=False)

