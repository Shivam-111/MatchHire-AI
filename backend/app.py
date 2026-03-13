from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os

from database import (
    init_db,
    create_user,
    get_user,
    add_job,
    get_jobs,
    get_job_by_id,
    apply_job,
    get_applications,
    get_applications_for_job,
    get_user_applications,
    upsert_candidate_profile,
    get_candidate_profile,
    list_candidates_with_profiles,
    add_contact
)

from resume_parser import analyze_resume, extract_text_from_pdf_bytes
from ai_service import (
    analyze_resume_with_ai,
    match_candidate_to_job_with_ai,
    get_career_recommendations_with_ai
)
from email_service import (
    email_service,
    send_application_confirmation,
    send_recruiter_notification,
    send_contact_notification
)

app = Flask(__name__)
CORS(app)

# Initialize database on startup
init_db()


@app.route("/")
def home():
    return jsonify({
        "message": "MatchHire AI backend running",
        "version": "1.0.0",
        "ai_enabled": bool(os.environ.get("AICC_API_KEY")),
        "email_configured": email_service.is_configured()
    })


# ---------------------------
# AUTH APIs
# ---------------------------

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    name = data.get("name", "")
    email = data.get("email", "")
    password = data.get("password", "")
    role = data.get("role", "candidate")  # candidate / recruiter

    if not all([name, email, password]):
        return jsonify({"message": "All fields are required"}), 400

    try:
        create_user(name, email, password, role)
        return jsonify({"message": "User created successfully"})
    except Exception as e:
        return jsonify({"message": "User already exists"}), 400


@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email", "")
    password = data.get("password", "")

    if not all([email, password]):
        return jsonify({"message": "Email and password required"}), 400

    user = get_user(email, password)

    if user:
        return jsonify({
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        })

    return jsonify({"message": "Invalid credentials"}), 401


# ---------------------------
# JOB APIs
# ---------------------------

@app.route("/jobs", methods=["GET"])
def jobs():
    """Get all jobs"""
    jobs_list = get_jobs()
    
    results = []
    for j in jobs_list:
        results.append({
            "id": j["id"],
            "recruiter_id": j["recruiter_id"],
            "title": j["title"],
            "description": j["description"],
            "skills": j["skills"],
            "created_at": j["created_at"]
        })

    return jsonify(results)


@app.route("/jobs/<int:job_id>", methods=["GET"])
def job_detail(job_id):
    """Get single job details"""
    job = get_job_by_id(job_id)
    if not job:
        return jsonify({"message": "Job not found"}), 404
    
    return jsonify({
        "id": job["id"],
        "recruiter_id": job["recruiter_id"],
        "title": job["title"],
        "description": job["description"],
        "skills": job["skills"],
        "created_at": job["created_at"]
    })


@app.route("/post-job", methods=["POST"])
def post_job():
    data = request.json

    recruiter_id = data.get("recruiter_id")
    title = data.get("title")
    description = data.get("description", "")
    skills = data.get("skills", "")

    if not recruiter_id:
        return jsonify({"message": "Recruiter ID required"}), 400

    if not title:
        return jsonify({"message": "Job title required"}), 400

    try:
        add_job(
            recruiter_id,
            title,
            description,
            skills,
            datetime.utcnow().isoformat()
        )

        return jsonify({"message": "Job posted successfully"})

    except Exception as e:
        print("POST JOB ERROR:", e)
        return jsonify({"message": "Database error"}), 500


# ---------------------------
# RESUME ANALYSIS WITH AI
# ---------------------------

@app.route("/analyze", methods=["POST"])
def analyze():
    """Legacy endpoint - uses rule-based analysis"""
    data = request.json
    resume_text = data.get("resume", "")

    jobs = get_jobs()
    jobs_list = []

    for j in jobs:
        jobs_list.append({
            "id": j["id"],
            "title": j["title"],
            "skills": j["skills"]
        })

    skills, results = analyze_resume(resume_text, jobs_list)

    return jsonify({
        "extracted_skills": skills,
        "matches": results
    })


@app.route("/analyze-ai", methods=["POST"])
def analyze_ai():
    """AI-powered resume analysis using AICC API"""
    data = request.json
    resume_text = data.get("resume", "")

    if not resume_text:
        return jsonify({"message": "Resume text is required"}), 400

    # Use AI to analyze resume
    ai_result = analyze_resume_with_ai(resume_text)
    
    # Also get rule-based results for comparison
    jobs = get_jobs()
    jobs_list = []
    for j in jobs:
        jobs_list.append({
            "id": j["id"],
            "title": j["title"],
            "skills": j["skills"]
        })
    
    rule_skills, rule_matches = analyze_resume(resume_text, jobs_list)
    
    # Use AI skills if available, otherwise fallback to rule-based
    extracted_skills = ai_result.get("skills") or rule_skills
    experience = ai_result.get("experience", [])
    education = ai_result.get("education", [])
    summary = ai_result.get("summary", "")
    ai_analyzed = ai_result.get("ai_analyzed", False)

    return jsonify({
        "extracted_skills": extracted_skills,
        "experience": experience,
        "education": education,
        "summary": summary,
        "ai_analyzed": ai_analyzed,
        "matches": rule_matches  # Include job matches
    })


# ---------------------------
# AI JOB MATCHING
# ---------------------------

@app.route("/match-job", methods=["POST"])
def match_job():
    """
    Calculate AI-powered match score between candidate and job
    """
    data = request.json
    
    job_id = data.get("job_id")
    candidate_skills = data.get("skills", [])
    
    if not job_id:
        return jsonify({"message": "Job ID is required"}), 400
    
    job = get_job_by_id(job_id)
    if not job:
        return jsonify({"message": "Job not found"}), 404
    
    job_skills = [s.strip() for s in (job["skills"] or "").split(",") if s.strip()]
    job_description = job["description"] or ""
    
    # Use AI for matching
    match_result = match_candidate_to_job_with_ai(
        candidate_skills=candidate_skills,
        job_title=job["title"],
        job_description=job_description,
        job_skills=job_skills
    )
    
    return jsonify({
        "job_id": job_id,
        "job_title": job["title"],
        "match_score": match_result.get("match_score", 0),
        "matched_skills": match_result.get("matched_skills", []),
        "missing_skills": match_result.get("missing_skills", []),
        "recommendations": match_result.get("recommendations", []),
        "ai_analyzed": match_result.get("ai_analyzed", False)
    })


@app.route("/career-recommendations", methods=["POST"])
def career_recommendations():
    """Get AI-powered career recommendations"""
    data = request.json
    candidate_skills = data.get("skills", [])
    target_role = data.get("target_role")
    
    recommendations = get_career_recommendations_with_ai(
        candidate_skills, target_role
    )
    
    return jsonify(recommendations)


# ---------------------------
# APPLY JOB
# ---------------------------

@app.route("/apply", methods=["POST"])
def apply():
    data = request.json

    user_id = data.get("user_id")
    job_id = data.get("job_id")
    score = data.get("score", 0)

    if not all([user_id, job_id]):
        return jsonify({"message": "User ID and Job ID are required"}), 400

    # CHECK PROFILE COMPLETED
    profile = get_candidate_profile(user_id)

    if not profile or not profile["resume_text"]:
        return jsonify({
            "message": "Complete your profile and upload resume before applying"
        }), 400

    apply_job(user_id, job_id, score, datetime.utcnow().isoformat())

    return jsonify({"message": "Application submitted successfully"})


def get_user_by_id(user_id):
    """Helper to get user by ID"""
    from database import get_connection
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    return user


# ---------------------------
# CANDIDATE DASHBOARD
# ---------------------------

@app.route("/my-applications", methods=["GET"])
def my_applications():
    """Get applications for a specific candidate"""
    user_id = request.args.get("user_id", type=int)
    
    if not user_id:
        return jsonify({"message": "User ID is required"}), 400
    
    apps = get_user_applications(user_id)
    
    results = []
    for a in apps:
        results.append({
            "id": a["id"],
            "job_id": a["job_id"],
            "job_title": a["title"],
            "company": a.get("company", "Company"),
            "match_score": a["match_score"],
            "applied_at": a["created_at"],
            "status": a.get("status", "pending")
        })
    
    return jsonify(results)


# ---------------------------
# RECRUITER DASHBOARD
# ---------------------------

@app.route("/applications", methods=["GET"])
def applications():
    """Get all applications (for recruiter dashboard)"""
    apps = get_applications()

    results = []

    for a in apps:
        results.append({
            "id": a["id"],
            "candidate_id": a["candidate_id"],
            "candidate": a["name"],
            "candidate_email": a["email"],
            "job_id": a["job_id"],
            "job": a["title"],
            "match_score": a["match_score"],
            "applied_at": a["created_at"]
        })

    return jsonify(results)


@app.route("/jobs/<int:job_id>/applications", methods=["GET"])
def applications_for_job(job_id):
    """Get applications for a specific job"""
    apps = get_applications_for_job(job_id)

    results = []
    for a in apps:
        # Get candidate profile
        profile = get_candidate_profile(a["candidate_id"])
        
        results.append({
            "candidate_id": a["candidate_id"],
            "candidate": a["name"],
            "candidate_email": a["email"],
            "match_score": a["match_score"],
            "applied_at": a["created_at"],
            "resume_text": profile["resume_text"] if profile else None,
            "extracted_skills": profile["extracted_skills"] if profile else ""
        })

    return jsonify(results)


# ---------------------------
# PROFILE MANAGEMENT
# ---------------------------

@app.route("/profile/<int:user_id>", methods=["GET"])
def profile_get(user_id):
    """Get candidate profile"""
    p = get_candidate_profile(user_id)
    if not p:
        return jsonify({
            "user_id": user_id, 
            "phone": "", 
            "headline": "", 
            "extracted_skills": [], 
            "resume_text": "",
            "updated_at": None
        })

    skills = (p["extracted_skills"] or "")
    skills_list = [s.strip() for s in skills.split(",") if s.strip()]

    return jsonify({
        "user_id": p["user_id"],
        "phone": p["phone"] or "",
        "headline": p["headline"] or "",
        "resume_filename": p["resume_filename"],
        "resume_text": p["resume_text"],
        "extracted_skills": skills_list,
        "updated_at": p["updated_at"]
    })


@app.route("/profile/<int:user_id>", methods=["POST"])
def profile_upsert(user_id):
    """Update candidate profile (without resume)"""
    data = request.json or {}
    phone = data.get("phone", "")
    headline = data.get("headline", "")

    existing = get_candidate_profile(user_id)
    resume_filename = existing["resume_filename"] if existing else None
    resume_text = existing["resume_text"] if existing else ""
    extracted_skills = existing["extracted_skills"] if existing else ""

    upsert_candidate_profile(
        user_id=user_id,
        phone=phone,
        headline=headline,
        resume_filename=resume_filename,
        resume_text=resume_text,
        extracted_skills=extracted_skills,
        updated_at=datetime.utcnow().isoformat()
    )

    return jsonify({"message": "Profile saved"})


@app.route("/upload-resume", methods=["POST"])
def upload_resume():
    """Upload and analyze resume"""
    user_id = int(request.form.get("user_id", "0"))
    if "file" not in request.files:
        return jsonify({"message": "No file provided"}), 400

    f = request.files["file"]
    pdf_bytes = f.read()

    try:
        resume_text = extract_text_from_pdf_bytes(pdf_bytes)
    except Exception as e:
        return jsonify({"message": f"Failed to parse PDF: {str(e)}"}), 400

    # Get AI analysis
    ai_result = analyze_resume_with_ai(resume_text)
    
    # Get rule-based analysis for job matching
    jobs = get_jobs()
    jobs_list = []
    for j in jobs:
        jobs_list.append({
            "id": j["id"],
            "title": j["title"],
            "skills": j["skills"]
        })

    rule_skills, matches = analyze_resume(resume_text, jobs_list)
    
    # Use AI skills if available
    skills = ai_result.get("skills") or rule_skills
    experience = ai_result.get("experience", [])
    education = ai_result.get("education", [])
    summary = ai_result.get("summary", "")

    # Get existing profile data
    existing = get_candidate_profile(user_id)
    phone = existing["phone"] if existing else ""
    headline = existing["headline"] if existing else ""

    # Save profile with extracted skills
    upsert_candidate_profile(
        user_id=user_id,
        phone=phone,
        headline=headline,
        resume_filename=f.filename,
        resume_text=resume_text,
        extracted_skills=",".join(skills),
        updated_at=datetime.utcnow().isoformat()
    )

    return jsonify({
        "message": "Resume uploaded successfully",
        "extracted_skills": skills,
        "experience": experience,
        "education": education,
        "summary": summary,
        "ai_analyzed": ai_result.get("ai_analyzed", False),
        "matches": matches
    })


# ---------------------------
# RECRUITER: VIEW CANDIDATES
# ---------------------------

@app.route("/recruiter/candidates", methods=["GET"])
def recruiter_candidates():
    """Get all candidates with their profiles"""
    job_id = request.args.get("job_id")
    candidates = list_candidates_with_profiles()

    job = None
    job_skills = []
    if job_id:
        for j in get_jobs():
            if int(j["id"]) == int(job_id):
                job = j
                job_skills = [s.strip().lower() for s in (j["skills"] or "").split(",") if s.strip()]
                break

    results = []
    for c in candidates:
        skills = (c["extracted_skills"] or "")
        skills_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
        
        # Calculate match score if job specified
        score = None
        missing_skills = []
        if job_id and job_skills:
            from resume_parser import calculate_match
            score = calculate_match(skills_list, job_skills)
            missing_skills = list(set(job_skills) - set(skills_list))
        
        results.append({
            "id": c["id"],
            "name": c["name"],
            "email": c["email"],
            "headline": c["headline"] or "",
            "phone": c["phone"] or "",
            "skills": skills_list,
            "resume_filename": c.get("resume_filename"),
            "match_score": score,
            "missing_skills": missing_skills,
            "updated_at": c["updated_at"]
        })

    # Sort by match score if job specified
    if job_id:
        results.sort(key=lambda x: x["match_score"] or 0, reverse=True)

    return jsonify({
        "job_id": int(job_id) if job_id else None,
        "job_title": job["title"] if job else None,
        "candidates": results
    })


# ---------------------------
# CONTACT CANDIDATE
# ---------------------------

@app.route("/contact-candidate", methods=["POST"])
def contact_candidate():
    """Send message to candidate from recruiter"""
    data = request.json
    
    recruiter_id = data.get("recruiter_id")
    candidate_id = data.get("candidate_id")
    job_id = data.get("job_id")
    message = data.get("message", "")
    
    if not all([recruiter_id, candidate_id, message]):
        return jsonify({"message": "All fields are required"}), 400
    
    # Get candidate and recruiter info
    from database import get_connection
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE id = ?", (candidate_id,))
    candidate = cursor.fetchone()
    
    cursor.execute("SELECT * FROM users WHERE id = ?", (recruiter_id,))
    recruiter = cursor.fetchone()
    
    conn.close()
    
    if not candidate or not recruiter:
        return jsonify({"message": "User not found"}), 404
    
    # Get job title if provided
    job_title = None
    if job_id:
        job = get_job_by_id(job_id)
        job_title = job["title"] if job else None
    
    # Save contact to database
    add_contact(
        recruiter_id=recruiter_id,
        candidate_id=candidate_id,
        job_id=job_id,
        message=message,
        created_at=datetime.utcnow().isoformat()
    )
    
    # Send email notification
    send_contact_notification(
        to_email=candidate["email"],
        sender_name=recruiter["name"],
        message=message,
        job_title=job_title
    )
    
    return jsonify({"message": "Message sent to candidate"})


# ---------------------------
# CONFIGURATION
# ---------------------------

@app.route("/config", methods=["GET"])
def get_config():
    """Get frontend configuration"""
    return jsonify({
        "ai_enabled": bool(os.environ.get("AICC_API_KEY")),
        "email_configured": email_service.is_configured(),
        "app_name": "MatchHire AI"
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)

