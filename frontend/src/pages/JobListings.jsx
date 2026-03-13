import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { jobsAPI, profileAPI, aiAPI, applicationAPI } from "../services/api";

export default function JobListings() {

  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyingJob, setApplyingJob] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {

      const jobsData = await jobsAPI.getAll();
      const profileData = await profileAPI.get(user.id);

      setJobs(jobsData);
      setProfile(profileData);

    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleApply = async (job) => {

    // 🚨 PROFILE CHECK
    if (!profile?.resume_text) {
      setApplicationMessage("Please complete your profile and upload resume before applying.");
      return;
    }

    setApplyingJob(job);

    let matchScore = 0;

    if (profile?.extracted_skills) {

      try {

        const matchResult = await aiAPI.matchJob(job.id, profile.extracted_skills);
        matchScore = matchResult.match_score;

      } catch (error) {
        console.error("Error calculating match score:", error);
      }

    }

    try {

      console.log("Applying:", user.id, job.id, matchScore);
      await applicationAPI.apply(user.id, job.id, matchScore);
      setApplicationMessage("Application submitted successfully!");
      await loadData();
      
      setTimeout(() => {
        setApplyingJob(null);
        setApplicationMessage("");
      }, 2000);

    } catch (error) {

      setApplicationMessage("Failed to apply. You may have already applied.");

    }
  };


  const jobsWithScores = jobs.map(job => {

    if (!profile?.extracted_skills)
      return { ...job, matchScore: null };

    const candidateSkills = profile.extracted_skills.map(s => s.toLowerCase());
    const jobSkills = (job.skills || "").split(",").map(s => s.trim().toLowerCase());

    const matched = candidateSkills.filter(s => jobSkills.includes(s));

    const score = jobSkills.length
      ? Math.round((matched.length / jobSkills.length) * 100)
      : 0;

    return { ...job, matchScore: score };

  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));


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

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Browse Jobs
        </h1>

        {applicationMessage && (

          <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-lg">
            {applicationMessage}
          </div>

        )}


        {jobsWithScores.map((job, index) => (

          <motion.div
whileHover={{ scale: 1.02 }}
transition={{ duration: 0.2 }}
className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6"
>

            <div className="flex justify-between items-start">

              <div>

                <h3 className="text-xl font-semibold text-gray-800">
                  {job.title}
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </p>

                {job.description && (
                  <p className="text-gray-600 mt-3">
                    {job.description}
                  </p>
                )}

                {job.skills && (

                  <div className="flex flex-wrap gap-2 mt-3">

                    {job.skills.split(",").map((skill, i) => (

                      <span
                        key={i}
                        className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full"
                      >
                        {skill.trim()}
                      </span>

                    ))}

                  </div>

                )}

              </div>


              {job.matchScore !== null && (

                <div className="text-center">

                  <div className="text-xl font-bold text-indigo-600">
                    {job.matchScore}%
                  </div>

                  <div className="text-xs text-gray-500">
                    Match
                  </div>

                </div>

              )}

            </div>


            <div className="flex justify-end mt-4">

              {applyingJob?.id === job.id ? (

                <button
                  disabled
                  className="px-6 py-2 bg-gray-400 text-white rounded-lg"
                >
                  Applying...
                </button>

              ) : (

                <motion.button
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.95 }}
onClick={() => handleApply(job)}
className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
>
Apply Now
</motion.button>

              )}

            </div>

          </motion.div>

        ))}

      </div>

    </div>

  );

}