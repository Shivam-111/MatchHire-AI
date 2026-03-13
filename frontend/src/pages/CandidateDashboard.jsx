import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { profileAPI, jobsAPI, applicationAPI } from "../services/api";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      const [profileData, jobsData, appsData] = await Promise.all([
        profileAPI.get(user.id),
        jobsAPI.getAll(),
        applicationAPI.getMyApplications(user.id)
      ]);
      setProfile(profileData);
      setJobs(jobsData.slice(0, 5));
      setApplications(appsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const profileStrength = profile?.extracted_skills?.length > 0 ? 
    Math.min(100, 40 + (profile.headline ? 20 : 0) + (profile.phone ? 20 : 0) + (profile.extracted_skills?.length * 5)) : 
    20;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-6"
          >
            <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-indigo-200 mt-1">Ready to find your next opportunity?</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Profile Strength Card */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Strength</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                    {profileStrength}% Complete
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profileStrength}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              {[
                { done: !!profile?.headline, text: "Add headline" },
                { done: !!profile?.phone, text: "Add phone number" },
                { done: profile?.extracted_skills?.length > 0, text: "Upload resume" },
              ].map((item, i) => (
                <div key={i} className="flex items-center text-sm">
                  {item.done ? (
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={item.done ? "text-green-600" : "text-gray-500"}>{item.text}</span>
                </div>
              ))}
            </div>
            <Link
              to="/profile"
              className="mt-4 block w-full py-2.5 bg-indigo-100 text-indigo-600 rounded-xl text-center font-medium hover:bg-indigo-200 transition"
            >
              Complete Profile
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-4 text-white">
                <div className="text-3xl font-bold">{profile?.extracted_skills?.length || 0}</div>
                <div className="text-sm text-indigo-100">Skills Found</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                <div className="text-3xl font-bold">{applications.length}</div>
                <div className="text-sm text-green-100">Applications</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white">
                <div className="text-3xl font-bold">{jobs.length}</div>
                <div className="text-sm text-orange-100">Open Jobs</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                <div className="text-3xl font-bold">
                  {applications.filter(a => a.match_score > 70).length}
                </div>
                <div className="text-sm text-blue-100">High Matches</div>
              </div>
            </div>
          </motion.div>

          {/* Skills Card */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Skills</h3>
            {profile?.extracted_skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.extracted_skills.slice(0, 8).map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {profile.extracted_skills.length > 8 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    +{profile.extracted_skills.length - 8} more
                  </span>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📄</div>
                <p className="text-gray-500 mb-4">Upload your resume to extract skills</p>
                <Link
                  to="/profile"
                  className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Upload Resume
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Recommended Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recommended Jobs</h2>
            <Link to="/jobs" className="text-indigo-600 hover:text-indigo-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="grid gap-4">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-indigo-500"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                    <p className="text-gray-500 mt-1">{job.description?.substring(0, 100)}...</p>
                    <div className="flex gap-2 mt-3">
                      {job.skills?.split(",").slice(0, 4).map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    to={`/jobs`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    View
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Applications</h2>
            <Link to="/my-applications" className="text-indigo-600 hover:text-indigo-700 font-medium">
              View All →
            </Link>
          </div>
          {applications.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Job</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Match Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Applied</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.slice(0, 5).map((app, index) => (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">{app.job_title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          app.match_score > 70 ? 'bg-green-100 text-green-700' :
                          app.match_score > 40 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {app.match_score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {app.status || "Pending"}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-4">Start applying to jobs to see them here</p>
              <Link
                to="/jobs"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                Browse Jobs
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

