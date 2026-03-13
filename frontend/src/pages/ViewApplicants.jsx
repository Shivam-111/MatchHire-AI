import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import CandidateCard from "../components/CandidateCard";
import { useAuth } from "../context/AuthContext";
import { jobsAPI, recruiterAPI } from "../services/api";

export default function ViewApplicants() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactStatus, setContactStatus] = useState({});

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      const [jobData, appsData] = await Promise.all([
        jobsAPI.getById(jobId),
        jobsAPI.getApplications(jobId)
      ]);
      
      setJob(jobData);
      setApplicants(appsData);
    } catch (error) {
      console.error("Error loading applicants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (candidateId, message) => {
    try {
      await recruiterAPI.contactCandidate(user.id, candidateId, jobId, message);
      setContactStatus(prev => ({
        ...prev,
        [candidateId]: "Message sent successfully!"
      }));
      setTimeout(() => {
        setContactStatus(prev => ({
          ...prev,
          [candidateId]: ""
        }));
      }, 3000);
    } catch (error) {
      setContactStatus(prev => ({
        ...prev,
        [candidateId]: "Failed to send message"
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-2">
            <Link
              to="/recruiter/dashboard"
              className="text-indigo-600 hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Applicants for {job?.title}
          </h1>
          <p className="text-gray-600">{applicants.length} candidate(s) applied</p>
        </motion.div>

        {applicants.length > 0 ? (
          <div className="grid gap-6">
            {applicants.map((applicant, index) => (
              <motion.div
                key={applicant.candidate_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold">
                        {applicant.candidate.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {applicant.candidate}
                        </h3>
                        <p className="text-gray-600">{applicant.candidate_email}</p>
                        {contactStatus[applicant.candidate_id] && (
                          <p className={`text-sm mt-1 ${
                            contactStatus[applicant.candidate_id].includes("success") 
                              ? "text-green-600" : "text-red-600"
                          }`}>
                            {contactStatus[applicant.candidate_id]}
                          </p>
                        )}
                      </div>
                    </div>

                    {applicant.extracted_skills && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {applicant.extracted_skills.split(",").map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center ml-6">
                    <div
                      className={`w-16 h-16 rounded-full flex flex-col items-center justify-center ${
                        applicant.match_score >= 80
                          ? "bg-green-100"
                          : applicant.match_score >= 50
                          ? "bg-yellow-100"
                          : "bg-red-100"
                      }`}
                    >
                      <span className={`text-xl font-bold ${
                        applicant.match_score >= 80
                          ? "text-green-700"
                          : applicant.match_score >= 50
                          ? "text-yellow-700"
                          : "text-red-700"
                      }`}>
                        {applicant.match_score || 0}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">Match</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleContact(applicant.candidate_id, "Hi! I came across your profile and I'm interested in discussing the position further.")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Contact Candidate
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-semibold text-gray-800">No Applicants Yet</h2>
            <p className="text-gray-600 mt-2">Share the job posting to attract candidates</p>
          </div>
        )}
      </div>
    </div>
  );
}

