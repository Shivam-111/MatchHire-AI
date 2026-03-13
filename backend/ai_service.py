"""
AICC AI Service for MatchHire AI Platform
This module handles all AI-powered features using the AICC API.
"""

import os
import json
import requests
from typing import Dict, List, Optional

# AICC API Configuration
# In production, use environment variables
AICC_API_KEY = os.environ.get("AICC_API_KEY", "")
AICC_API_URL = os.environ.get("AICC_API_URL", "https://api.aicc.com/v1")
AICC_MODEL = os.environ.get("AICC_MODEL", "gpt-4")


class AIService:
    """Service class for AICC AI operations"""
    
    def __init__(self, api_key: str = None, api_url: str = None):
        self.api_key = api_key or AICC_API_KEY
        self.api_url = api_url or AICC_API_URL
        self.model = AICC_MODEL
        
    def _call_api(self, prompt: str, system_message: str = None) -> Optional[str]:
        """
        Make API call to AICC service.
        Returns the response text or None if failed.
        """
        if not self.api_key:
            # Return None to indicate API is not configured
            # Fallback to rule-based system will be used
            return None
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                print(f"API Error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"API Call Failed: {str(e)}")
            return None
    
    def analyze_resume(self, resume_text: str) -> Dict:
        """
        Analyze resume using AI to extract skills, experience, and education.
        
        Returns:
            Dict with keys: skills, experience, education, summary
        """
        system_msg = """You are an expert HR analyst specializing in resume parsing and candidate evaluation.
Analyze the given resume and extract information in a structured JSON format.
Be thorough and extract all relevant technical skills, work experience, and education details."""
        
        prompt = f"""Analyze the following resume and extract the information in JSON format:

Resume Text:
{resume_text}

Return a JSON object with this exact structure:
{{
    "skills": ["list of technical skills, tools, technologies"],
    "experience": ["list of work experience with job titles and companies"],
    "education": ["list of degrees and institutions"],
    "summary": "2-3 sentence summary of the candidate's profile"
}}

Only return valid JSON, no additional text."""

        response = self._call_api(prompt, system_msg)
        
        if response:
            try:
                # Try to parse the JSON response
                # Sometimes AI wraps in markdown code blocks
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0]
                    
                result = json.loads(response)
                return {
                    "skills": result.get("skills", []),
                    "experience": result.get("experience", []),
                    "education": result.get("education", []),
                    "summary": result.get("summary", ""),
                    "ai_analyzed": True
                }
            except json.JSONDecodeError:
                pass
        
        # Fallback: Return empty result if API fails
        return {
            "skills": [],
            "experience": [],
            "education": [],
            "summary": "",
            "ai_analyzed": False
        }
    
    def match_candidate_to_job(
        self, 
        candidate_skills: List[str], 
        job_title: str, 
        job_description: str,
        job_skills: List[str]
    ) -> Dict:
        """
        Calculate match score between candidate and job using AI.
        
        Returns:
            Dict with match_score, missing_skills, recommendations
        """
        system_msg = """You are an expert HR consultant specializing in talent matching.
Analyze the match between a candidate's skills and a job requirements.
Provide accurate match scores and actionable recommendations."""
        
        prompt = f"""Calculate the match score between a candidate and a job position.

Job Title: {job_title}
Job Description: {job_description}
Required Skills: {", ".join(job_skills)}
Candidate Skills: {", ".join(candidate_skills)}

Return a JSON object with this exact structure:
{{
    "match_score": 0-100,
    "matched_skills": ["list of skills the candidate has that match job requirements"],
    "missing_skills": ["list of important skills the candidate is missing"],
    "recommendations": ["actionable suggestions for the candidate to improve their candidacy"]
}}

Only return valid JSON, no additional text."""

        response = self._call_api(prompt, system_msg)
        
        if response:
            try:
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0]
                    
                result = json.loads(response)
                return {
                    "match_score": result.get("match_score", 0),
                    "matched_skills": result.get("matched_skills", []),
                    "missing_skills": result.get("missing_skills", []),
                    "recommendations": result.get("recommendations", []),
                    "ai_analyzed": True
                }
            except json.JSONDecodeError:
                pass
        
        # Fallback calculation
        candidate_set = set(s.lower() for s in candidate_skills)
        job_set = set(s.lower() for s in job_skills)
        matched = candidate_set.intersection(job_set)
        
        score = int((len(matched) / len(job_set)) * 100) if job_set else 0
        
        return {
            "match_score": score,
            "matched_skills": list(matched),
            "missing_skills": list(job_set - candidate_set),
            "recommendations": [f"Learn {s}" for s in (job_set - candidate_set)][:3],
            "ai_analyzed": False
        }
    
    def get_career_recommendations(
        self, 
        candidate_skills: List[str],
        target_role: str = None
    ) -> Dict:
        """
        Get career path recommendations for a candidate.
        
        Returns:
            Dict with suggested_roles, skill_gaps, learning_resources
        """
        system_msg = """You are a career advisor AI specializing in tech industry career paths.
Provide actionable career advice based on the candidate's current skills."""
        
        prompt = f"""Based on the candidate's skills, provide career recommendations.

Candidate Skills: {", ".join(candidate_skills)}
Target Role (if any): {target_role or "Not specified"}

Return a JSON object with this exact structure:
{{
    "suggested_roles": ["list of suitable job roles for this candidate"],
    "skill_gaps": ["skills to develop for career growth"],
    "learning_resources": ["recommended learning paths or courses"]
}}

Only return valid JSON, no additional text."""

        response = self._call_api(prompt, system_msg)
        
        if response:
            try:
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0]
                    
                result = json.loads(response)
                return {
                    "suggested_roles": result.get("suggested_roles", []),
                    "skill_gaps": result.get("skill_gaps", []),
                    "learning_resources": result.get("learning_resources", []),
                    "ai_analyzed": True
                }
            except json.JSONDecodeError:
                pass
        
        # Fallback
        return {
            "suggested_roles": ["Software Developer", "Full Stack Developer"],
            "skill_gaps": [],
            "learning_resources": [],
            "ai_analyzed": False
        }
    
    def generate_job_description(
        self,
        title: str,
        company: str = None,
        requirements: List[str] = None
    ) -> str:
        """
        Generate a job description using AI.
        
        Returns:
            Generated job description text
        """
        system_msg = """You are an expert HR professional specializing in job descriptions.
Create professional, comprehensive job descriptions that attract qualified candidates."""
        
        req_text = ", ".join(requirements) if requirements else "Not specified"
        
        prompt = f"""Generate a comprehensive job description.

Job Title: {title}
Company: {company or "Company"}
Key Requirements: {req_text}

Return a JSON object with this exact structure:
{{
    "title": "Job Title",
    "description": "Comprehensive job description (3-4 paragraphs)",
    "responsibilities": ["list of key responsibilities"],
    "requirements": ["list of requirements"],
    "benefits": ["list of benefits"]
}}

Only return valid JSON, no additional text."""

        response = self._call_api(prompt, system_msg)
        
        if response:
            try:
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0]
                    
                result = json.loads(response)
                return json.dumps(result, indent=2)
            except json.JSONDecodeError:
                pass
        
        # Fallback
        return json.dumps({
            "title": title,
            "description": f"We are looking for a {title} to join our team.",
            "requirements": requirements or [],
            "responsibilities": [],
            "benefits": []
        }, indent=2)


# Create singleton instance
ai_service = AIService()


# Convenience functions
def analyze_resume_with_ai(resume_text: str) -> Dict:
    """Wrapper function for resume analysis"""
    return ai_service.analyze_resume(resume_text)


def match_candidate_to_job_with_ai(
    candidate_skills: List[str], 
    job_title: str, 
    job_description: str,
    job_skills: List[str]
) -> Dict:
    """Wrapper function for job matching"""
    return ai_service.match_candidate_to_job(
        candidate_skills, job_title, job_description, job_skills
    )


def get_career_recommendations_with_ai(
    candidate_skills: List[str],
    target_role: str = None
) -> Dict:
    """Wrapper function for career recommendations"""
    return ai_service.get_career_recommendations(candidate_skills, target_role)

