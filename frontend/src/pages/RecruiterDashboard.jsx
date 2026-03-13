import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { jobsAPI, applicationAPI, profileAPI } from "../services/api";
export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {

  try {

    const jobsData = await jobsAPI.getAll()
    const appsData = await applicationAPI.getAll()

    const recruiterJobs = jobsData.filter(
      job => Number(job.recruiter_id) === Number(user.id)
    )

    setJobs(recruiterJobs)

    const recruiterApplications = appsData.filter(
      app => recruiterJobs.some(job => job.id === app.job_id)
    )

    setApplications(recruiterApplications)

  } catch (error) {

    console.error("Error loading dashboard:", error)

  } finally {

    setLoading(false)

  }

}
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
          <h1 className="text-3xl font-bold text-gray-800">
            Recruiter Dashboard
          </h1>
          <p className="text-gray-600">Manage your job postings and candidates</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="text-3xl font-bold text-indigo-600">{jobs.length}</div>
            <div className="text-gray-600">Active Jobs</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="text-3xl font-bold text-green-600">{applications.length}</div>
            <div className="text-gray-600">Total Applications</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="text-3xl font-bold text-blue-600">
              {applications.filter(a => a.match_score >= 80).length}
            </div>
            <div className="text-gray-600">High Match Candidates</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="text-3xl font-bold text-purple-600">
              {new Set(applications.map(a => a.candidate_id)).size}
            </div>
            <div className="text-gray-600">Unique Candidates</div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Your Job Postings</h2>
              <Link to="/post-job" className="text-indigo-600 hover:underline text-sm">
                Post New Job
              </Link>
            </div>

            {jobs.length > 0 ? (
              <div className="space-y-3">
                {jobs.slice(0, 5).map(job => {
                  const jobApps = applications.filter(a => a.job_id === job.id);
                  return (
                    <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">{job.title}</h3>
                          <p className="text-sm text-gray-500">
                            {jobApps.length} application(s)
                          </p>
                        </div>
                        <Link
                          to={`/recruiter/applicants/${job.id}`}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No jobs posted yet</p>
                <Link to="/post-job" className="text-indigo-600 hover:underline">
                  Post your first job
                </Link>
              </div>
            )}
          </motion.div>

          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Applications</h2>

            {applications.length > 0 ? (
              <div className="space-y-3">
                {applications.slice(0, 5).map(app => (
                  <div key={app.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{app.candidate}</h3>
                        <p className="text-sm text-gray-500">
                          Applied for: {app.job}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-sm font-medium ${
                        app.match_score >= 80 ? "bg-green-100 text-green-700" :
                        app.match_score >= 50 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {app.match_score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No applications yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* ATS Applicant Tracking System */}

<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.38 }}
className="mt-8 bg-white rounded-xl shadow-md p-6"
>

<h2 className="text-xl font-semibold text-gray-800 mb-4">
ATS Candidate Portal
</h2>

{applications.length > 0 ? (

<table className="w-full">

<thead>
<tr className="border-b text-left text-gray-600">
<th className="p-2">Candidate</th>
<th className="p-2">Job</th>
<th className="p-2">ATS Score</th>
<th className="p-2">Resume</th>
</tr>
</thead>

<tbody>

{applications.map(app => (

<tr key={app.id} className="border-b hover:bg-gray-50">

<td className="p-2 font-medium">
{app.candidate}
</td>

<td className="p-2">
{app.job}
</td>

<td className="p-2">

<span className={`px-2 py-1 rounded text-sm font-medium ${
app.match_score >= 80 ? "bg-green-100 text-green-700" :
app.match_score >= 50 ? "bg-yellow-100 text-yellow-700" :
"bg-red-100 text-red-700"
}`}>

{app.match_score}%

</span>

</td>

<td className="p-2">

<button
onClick={() => viewResume(app.candidate_id)}
className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
>

View Resume

</button>

</td>

</tr>

))}

</tbody>

</table>

) : (

<div className="text-gray-500 text-center py-6">
No applicants yet
</div>

)}

</motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md p-6 text-white"
        >
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              to="/post-job"
              className="block p-4 bg-white/20 rounded-lg hover:bg-white/30 transition text-center"
            >
              <div className="text-2xl mb-2">➕</div>
              <div>Post a Job</div>
            </Link>
            <Link
              to="/recruiter/candidates"
              className="block p-4 bg-white/20 rounded-lg hover:bg-white/30 transition text-center"
            >
              <div className="text-2xl mb-2">👥</div>
              <div>Browse Candidates</div>
            </Link>
            <Link
              to="/recruiter/dashboard"
              className="block p-4 bg-white/20 rounded-lg hover:bg-white/30 transition text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <div>View Analytics</div>
            </Link>
          </div>
        </motion.div>
      </div>
      {selectedCandidate && (

<div className="fixed inset-0 bg-black/50 flex items-center justify-center">

<div className="bg-white p-6 rounded-xl max-w-xl w-full">

<h2 className="text-xl font-bold mb-4">
Candidate Resume
</h2>

<p className="text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
{selectedCandidate.resume_text}
</p>

<button
onClick={() => setSelectedCandidate(null)}
className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
>

Close

</button>

</div>

</div>

)}
    </div>
  );
}

