/**
 * API Service for MatchHire AI
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function for making API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }
    
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ---------------------------
// Auth API
// ---------------------------

export const authAPI = {
  signup: async (name, email, password, role) => {
    return apiCall("/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  login: async (email, password) => {
    return apiCall("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};

// ---------------------------
// Jobs API
// ---------------------------

export const jobsAPI = {
  getAll: async () => {
    return apiCall("/jobs");
  },

  getById: async (jobId) => {
    return apiCall(`/jobs/${jobId}`);
  },

  post: async (recruiterId, title, description, skills) => {
    return apiCall("/post-job", {
      method: "POST",
      body: JSON.stringify({
        recruiter_id: recruiterId,
        title,
        description,
        skills,
      }),
    });
  },

  getApplications: async (jobId) => {
    return apiCall(`/jobs/${jobId}/applications`);
  },
};

// ---------------------------
// Resume API
// ---------------------------

export const resumeAPI = {
  upload: async (userId, file) => {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload-resume`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to upload resume");
    }
    return data;
  },

  analyze: async (resumeText) => {
    return apiCall("/analyze-ai", {
      method: "POST",
      body: JSON.stringify({ resume: resumeText }),
    });
  },
};

// ---------------------------
// Application API
// ---------------------------

export const applicationAPI = {
  apply: async (userId, jobId, score = 0) => {
    return apiCall("/apply", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        job_id: jobId,
        score,
      }),
    });
  },

  getMyApplications: async (userId) => {
    return apiCall(`/my-applications?user_id=${userId}`);
  },

  getAll: async () => {
    return apiCall("/applications");
  },
};

// ---------------------------
// Profile API
// ---------------------------

export const profileAPI = {
  get: async (userId) => {
    return apiCall(`/profile/${userId}`);
  },

  update: async (userId, phone, headline) => {
    return apiCall(`/profile/${userId}`, {
      method: "POST",
      body: JSON.stringify({ phone, headline }),
    });
  },
};

// ---------------------------
// AI Matching API
// ---------------------------

export const aiAPI = {
  matchJob: async (jobId, skills) => {
    return apiCall("/match-job", {
      method: "POST",
      body: JSON.stringify({ job_id: jobId, skills }),
    });
  },

  getCareerRecommendations: async (skills, targetRole = null) => {
    return apiCall("/career-recommendations", {
      method: "POST",
      body: JSON.stringify({ skills, target_role: targetRole }),
    });
  },
};

// ---------------------------
// Recruiter API
// ---------------------------

export const recruiterAPI = {
  getCandidates: async (jobId = null) => {
    const url = jobId 
      ? `/recruiter/candidates?job_id=${jobId}` 
      : "/recruiter/candidates";
    return apiCall(url);
  },

  contactCandidate: async (recruiterId, candidateId, jobId, message) => {
    return apiCall("/contact-candidate", {
      method: "POST",
      body: JSON.stringify({
        recruiter_id: recruiterId,
        candidate_id: candidateId,
        job_id: jobId,
        message,
      }),
    });
  },
};

// ---------------------------
// Config API
// ---------------------------

export const configAPI = {
  get: async () => {
    return apiCall("/config");
  },
};

export default {
  auth: authAPI,
  jobs: jobsAPI,
  resume: resumeAPI,
  application: applicationAPI,
  profile: profileAPI,
  ai: aiAPI,
  recruiter: recruiterAPI,
  config: configAPI,
};

