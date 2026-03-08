# MatchHire AI - AI-Driven Hiring Platform

A complete AI-powered hiring platform similar to LinkedIn/Naukri, built with React, Flask, and real AI analysis using AICC API.

## Features

### For Candidates
- Sign up / Login with role selection
- Browse jobs with AI-powered match scores
- Upload resume (PDF parsing with AI analysis)
- AI skill extraction from resume
- Job matching with recommendations
- Apply for jobs
- Track applications

### For Recruiters
- Sign up / Login
- Post jobs with required skills
- View all applicants with AI rankings
- Search and filter candidates
- Contact candidates via email

### AI Features (Real AI using AICC API)
- Resume analysis and parsing
- Skill extraction
- Job matching with match scores
- Missing skill detection
- Career recommendations

### Email Features (SMTP)
- Application confirmation emails
- Recruiter notification emails
- Contact candidate emails

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Backend**: Python Flask
- **Database**: SQLite
- **AI**: AICC API
- **Email**: SMTP

## Project Structure

```
MatchHire-AI/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── database.py         # Database operations
│   ├── resume_parser.py    # PDF parsing
│   ├── ai_service.py       # AICC AI integration
│   ├── email_service.py    # SMTP email service
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   ├── App.jsx         # Main app with routing
│   │   └── main.jsx        # Entry point
│   └── .env.example        # Environment variables template
├── database/
│   └── database.db         # SQLite database
├── package.json
└── README.md
```

## Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # Windows: venv\Scripts\activate
   # Linux/Mac: source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install flask flask-cors requests pypdf
   ```

4. Configure environment variables (optional):
   - Copy `.env.example` to `.env`
   - Add your AICC API key for AI features
   - Add SMTP credentials for email features
   
   Note: AI and email features work with fallback modes if not configured.

5. Run the backend:
   ```bash
   python app.py
   ```
   Server will start at http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   - Copy `.env.example` to `.env`
   - Update API URL if needed (default: http://localhost:5000)

4. Run the frontend:
   ```bash
   npm run dev
   ```
   Server will start at http://localhost:5173

## Usage

### Starting the Application

1. Start backend (Terminal 1):
   ```bash
   cd backend
   python app.py
   ```

2. Start frontend (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open browser at http://localhost:5173

### For Candidates

1. Sign up as a "Candidate"
2. Complete your profile
3. Upload your resume (PDF)
4. AI will analyze and extract your skills
5. Browse jobs and apply
6. View your applications and match scores

### For Recruiters

1. Sign up as a "Recruiter"
2. Post a job with required skills
3. View applicants for your jobs
4. See AI-powered candidate rankings
5. Contact candidates via email

## API Endpoints

### Authentication
- `POST /signup` - Create new user
- `POST /login` - Login user

### Jobs
- `GET /jobs` - Get all jobs
- `GET /jobs/<id>` - Get job details
- `POST /post-job` - Create new job

### Resume
- `POST /upload-resume` - Upload and analyze resume
- `POST /analyze-ai` - AI resume analysis

### Applications
- `POST /apply` - Apply for a job
- `GET /my-applications` - Get candidate's applications
- `GET /applications` - Get all applications (recruiter)

### Profile
- `GET /profile/<id>` - Get candidate profile
- `POST /profile/<id>` - Update profile

### AI Features
- `POST /match-job` - Calculate job match score
- `POST /career-recommendations` - Get career advice

### Recruiter
- `GET /recruiter/candidates` - List all candidates
- `POST /contact-candidate` - Contact a candidate

## Environment Variables

### Backend (.env)
```env
AICC_API_KEY=your_api_key
AICC_API_URL=https://api.aicc.com/v1
AICC_MODEL=gpt-4
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## Demo Mode

The application works in demo mode without API keys:
- **AI Features**: Uses rule-based fallback for resume analysis and matching
- **Email Features**: Prints emails to console instead of sending

## Screenshots

The application includes:
- Modern landing page with animations
- Clean signup/login with role selection
- Candidate dashboard with profile strength
- Job listings with AI match scores
- Profile management with resume upload
- Recruiter dashboard with analytics
- Candidate search with filters
- Contact candidate functionality

## License

MIT License

## Support

For issues or questions, please check the documentation or open an issue on GitHub.

