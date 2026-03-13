import re

# Simple skill database
SKILLS_DB = [
    "python",
    "java",
    "react",
    "javascript",
    "html",
    "css",
    "sql",
    "flask",
    "django",
    "machine learning",
    "data science",
    "aws",
    "docker",
    "node",
    "mongodb"
]


def extract_skills(resume_text):

    resume_text = resume_text.lower()

    found_skills = []

    for skill in SKILLS_DB:

        pattern = r"\b" + skill + r"\b"

        if re.search(pattern, resume_text):
            found_skills.append(skill)

    return found_skills


def calculate_match(candidate_skills, job_skills):

    candidate_set = set(candidate_skills)
    job_set = set(job_skills)

    matched = candidate_set.intersection(job_set)

    if len(job_set) == 0:
        return 0

    score = int((len(matched) / len(job_set)) * 100)

    return score


def analyze_resume(resume_text, jobs):

    skills = extract_skills(resume_text)

    results = []

    for job in jobs:

        job_skills = [s.strip().lower() for s in (job["skills"] or "").split(",") if s.strip()]

        score = calculate_match(skills, job_skills)

        results.append({
            "job_id": job["id"],
            "job_title": job["title"],
            "match_score": score,
            "matched_skills": sorted(list(set(skills).intersection(set(job_skills)))),
            "missing_skills": sorted(list(set(job_skills) - set(skills)))
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)

    return skills, results


def extract_text_from_pdf_bytes(pdf_bytes):
    """
    Demo-friendly PDF extraction using pypdf (already installed).
    """
    from pypdf import PdfReader
    import io

    reader = PdfReader(io.BytesIO(pdf_bytes))
    chunks = []
    for page in reader.pages:
        txt = page.extract_text() or ""
        if txt:
            chunks.append(txt)
    return "\n".join(chunks)
