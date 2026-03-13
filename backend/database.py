import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "..", "database", "database.db")

def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE applications ADD COLUMN status TEXT DEFAULT 'pending'")
    except:
        pass

    # USERS TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
    )
    """)

    # CANDIDATE PROFILES (resume + extracted skills)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS candidate_profiles (
        user_id INTEGER PRIMARY KEY,
        phone TEXT,
        headline TEXT,
        resume_filename TEXT,
        resume_text TEXT,
        extracted_skills TEXT,
        updated_at TEXT
    )
    """)

    # JOBS TABLE (tie to recruiter for demo)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recruiter_id INTEGER,
        title TEXT,
        description TEXT,
        skills TEXT,
        created_at TEXT
    )
    """)

    # APPLICATIONS TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        job_id INTEGER,
        match_score INTEGER,
        created_at TEXT,
        UNIQUE(user_id, job_id)
    )
    """)

    conn.commit()
    conn.close()


def create_user(name, email, password, role):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
        (name, email, password, role)
    )

    conn.commit()
    conn.close()


def get_user(email, password):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (email, password)
    )

    user = cursor.fetchone()

    conn.close()

    return user


def add_job(recruiter_id, title, description, skills, created_at):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO jobs (recruiter_id,title,description,skills,created_at) VALUES (?,?,?,?,?)",
        (recruiter_id, title, description, skills, created_at)
    )

    conn.commit()
    conn.close()


def get_jobs():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM jobs")

    jobs = cursor.fetchall()

    conn.close()

    return jobs


def apply_job(user_id, job_id, score, created_at):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT OR IGNORE INTO applications (user_id,job_id,match_score,created_at) VALUES (?,?,?,?)",
        (user_id, job_id, score, created_at)
    )

    conn.commit()
    conn.close()


def get_applications():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT users.id as candidate_id, users.name, users.email, jobs.id as job_id, jobs.title, applications.match_score, applications.created_at
    FROM applications
    JOIN users ON users.id = applications.user_id
    JOIN jobs ON jobs.id = applications.job_id
    ORDER BY applications.match_score DESC
    """)

    apps = cursor.fetchall()

    conn.close()

    return apps


def get_applications_for_job(job_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT users.id as candidate_id, users.name, users.email, applications.match_score, applications.created_at
    FROM applications
    JOIN users ON users.id = applications.user_id
    WHERE applications.job_id = ?
    ORDER BY applications.match_score DESC
    """, (job_id,))

    apps = cursor.fetchall()

    conn.close()

    return apps


def upsert_candidate_profile(user_id, phone, headline, resume_filename, resume_text, extracted_skills, updated_at):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO candidate_profiles (user_id, phone, headline, resume_filename, resume_text, extracted_skills, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
        phone=excluded.phone,
        headline=excluded.headline,
        resume_filename=excluded.resume_filename,
        resume_text=excluded.resume_text,
        extracted_skills=excluded.extracted_skills,
        updated_at=excluded.updated_at
    """, (user_id, phone, headline, resume_filename, resume_text, extracted_skills, updated_at))

    conn.commit()
    conn.close()


def get_candidate_profile(user_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM candidate_profiles WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return row


def list_candidates_with_profiles():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT users.id, users.name, users.email, users.role,
           candidate_profiles.phone, candidate_profiles.headline,
           candidate_profiles.extracted_skills, candidate_profiles.updated_at,
           candidate_profiles.resume_filename
    FROM users
    LEFT JOIN candidate_profiles ON candidate_profiles.user_id = users.id
    WHERE users.role = 'candidate'
    ORDER BY users.id DESC
    """)

    rows = cursor.fetchall()
    conn.close()
    return rows


def get_user_by_id(user_id):
    """Get user by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return row


def get_job_by_id(job_id):
    """Get job by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    row = cursor.fetchone()
    conn.close()
    return row


def get_user_applications(user_id):
    """Get all applications for a specific user (candidate)"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT applications.id, applications.job_id, applications.match_score, 
       applications.created_at,
       jobs.title
    FROM applications
    JOIN jobs ON jobs.id = applications.job_id
    WHERE applications.user_id = ?
    ORDER BY applications.created_at DESC
    """, (user_id,))
    
    rows = cursor.fetchall()
    conn.close()
    return rows


def add_contact(recruiter_id, candidate_id, job_id, message, created_at):
    """Add a contact message from recruiter to candidate"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recruiter_id INTEGER,
        candidate_id INTEGER,
        job_id INTEGER,
        message TEXT,
        created_at TEXT
    )
    """)
    
    cursor.execute("""
    INSERT INTO contacts (recruiter_id, candidate_id, job_id, message, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, (recruiter_id, candidate_id, job_id, message, created_at))
    
    conn.commit()
    conn.close()
