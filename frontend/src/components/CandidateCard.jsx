import { useState } from "react";
import SkillBadge from "./SkillBadge";

export default function CandidateCard({ candidate, onContact }) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState("");

  const handleContact = () => {
    if (message.trim()) {
      onContact(candidate.id, message);
      setMessage("");
      setShowContactForm(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800">
            {candidate.name}
          </h3>
          {candidate.headline && (
            <p className="text-gray-600 mt-1">{candidate.headline}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">{candidate.email}</p>
          {candidate.phone && (
            <p className="text-gray-500 text-sm">{candidate.phone}</p>
          )}
        </div>
        {candidate.match_score !== undefined && candidate.match_score !== null && (
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${
                candidate.match_score >= 80
                  ? "bg-green-100 text-green-700"
                  : candidate.match_score >= 50
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {candidate.match_score}%
            </div>
            <span className="text-xs text-gray-500 mt-1">Match</span>
          </div>
        )}
      </div>

      {candidate.skills && candidate.skills.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.slice(0, 8).map((skill, index) => (
              <SkillBadge key={index} skill={skill} type="default" />
            ))}
            {candidate.skills.length > 8 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                +{candidate.skills.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {candidate.missing_skills && candidate.missing_skills.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Missing Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {candidate.missing_skills.slice(0, 5).map((skill, index) => (
              <SkillBadge key={index} skill={skill} type="missing" />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Profile updated: {formatDate(candidate.updated_at)}
        </span>
        <button
          onClick={() => setShowContactForm(!showContactForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Contact
        </button>
      </div>

      {showContactForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message to the candidate..."
            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows="3"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => setShowContactForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleContact}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

