import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import SkillBadge from "../components/SkillBadge";
import { useAuth } from "../context/AuthContext";
import { profileAPI, resumeAPI } from "../services/api";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Form state
  const [headline, setHeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileAPI.get(user.id);
      setProfile(data);
      setHeadline(data.headline || "");
      setPhone(data.phone || "");
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await profileAPI.update(user.id, phone, headline);
      setMessage("Profile saved successfully!");
      loadProfile();
    } catch (error) {
      setMessage("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setMessage("Please select a PDF file");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const result = await resumeAPI.upload(user.id, resumeFile);
      setMessage("Resume uploaded and analyzed successfully!");
      setResumeFile(null);
      loadProfile();
    } catch (error) {
      setMessage(error.message || "Failed to upload resume");
    } finally {
      setUploading(false);
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
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600">Manage your profile and resume</p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-6 p-4 rounded-lg ${
              message.includes("success") 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </motion.div>
        )}

        <div className="grid gap-6">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
            
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{user.name}</div>
                  <div className="text-gray-600">{user.email}</div>
                  <div className="text-sm text-indigo-600 capitalize">{user.role}</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., Full Stack Developer with 5 years of experience"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </motion.div>

          {/* Resume Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resume</h2>
            
            {profile?.resume_filename ? (
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xl">📄</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{profile.resume_filename}</div>
                      <div className="text-sm text-gray-500">Resume uploaded</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                <div className="text-yellow-700">No resume uploaded yet</div>
              </div>
            )}

            <form onSubmit={handleResumeUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Resume (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !resumeFile}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition"
              >
                {uploading ? "Uploading & Analyzing..." : "Upload Resume"}
              </button>
            </form>
          </motion.div>

          {/* Extracted Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">AI-Extracted Skills</h2>
            
            {profile?.extracted_skills && profile.extracted_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.extracted_skills.map((skill, index) => (
                  <SkillBadge key={index} skill={skill} type="matched" />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                Upload your resume to extract skills using AI
              </p>
            )}

            {profile?.ai_analyzed && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-green-600">
                  ✓ Skills extracted using AI analysis
                </p>
              </div>
            )}
          </motion.div>

          {/* Experience & Education (if available from AI) */}
          {profile?.experience && profile.experience.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Experience</h2>
              <ul className="space-y-2">
                {profile.experience.map((exp, index) => (
                  <li key={index} className="text-gray-600">• {exp}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {profile?.education && profile.education.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Education</h2>
              <ul className="space-y-2">
                {profile.education.map((edu, index) => (
                  <li key={index} className="text-gray-600">• {edu}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

