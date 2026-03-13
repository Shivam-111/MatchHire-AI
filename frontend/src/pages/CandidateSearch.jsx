import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import CandidateCard from "../components/CandidateCard";
import { useAuth } from "../context/AuthContext";
import { recruiterAPI, jobsAPI } from "../services/api";

export default function CandidateSearch() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [loading, setLoading] = useState(true);
  const [contactStatus, setContactStatus] = useState({});

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [selectedJob]);

  const loadJobs = async () => {
    try {
      const data = await jobsAPI.getAll();
      setJobs(data);
    } catch (error) {
      console.error("Error loading jobs:", error);
    }
  };

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await recruiterAPI.getCandidates(selectedJob || null);
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error("Error loading candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (candidateId, message) => {
    try {
      await recruiterAPI.contactCandidate(user.id, candidateId, selectedJob || null, message);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">Search Candidates</h1>
          <p className="text-gray-600">Find the best talent for your positions</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex items-center space-x-4">
            <label className="text-gray-700 font-medium">Filter by Job:</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Candidates</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <button
              onClick={loadCandidates}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Apply Filter
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : candidates.length > 0 ? (
          <div className="grid gap-6">
            {candidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold">
                          {candidate.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {candidate.name}
                          </h3>
                          {candidate.headline && (
                            <p className="text-gray-600">{candidate.headline}</p>
                          )}
                          <p className="text-gray-500">{candidate.email}</p>
                          {contactStatus[candidate.id] && (
                            <p className={`text-sm mt-1 ${
                              contactStatus[candidate.id].includes("success") 
                                ? "text-green-600" : "text-red-600"
                            }`}>
                              {contactStatus[candidate.id]}
                            </p>
                          )}
                        </div>
                      </div>

                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.slice(0, 8).map((skill, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {candidate.missing_skills && candidate.missing_skills.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Missing Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {candidate.missing_skills.slice(0, 5).map((skill, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center ml-6">
                      {candidate.match_score !== undefined && candidate.match_score !== null && (
                        <>
                          <div
                            className={`w-16 h-16 rounded-full flex flex-col items-center justify-center ${
                              candidate.match_score >= 80
                                ? "bg-green-100"
                                : candidate.match_score >= 50
                                ? "bg-yellow-100"
                                : "bg-red-100"
                            }`}
                          >
                            <span className={`text-xl font-bold ${
                              candidate.match_score >= 80
                                ? "text-green-700"
                                : candidate.match_score >= 50
                                ? "text-yellow-700"
                                : "text-red-700"
                            }`}>
                              {candidate.match_score}%
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">Match</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleContact(candidate.id, "Hi! I came across your profile and I'm interested in discussing potential opportunities.")}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Contact Candidate
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-semibold text-gray-800">No Candidates Found</h2>
            <p className="text-gray-600 mt-2">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
}

