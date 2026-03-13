import { Link } from "react-router-dom";

export default function JobCard({ job, matchScore, onApply }) {
  const skills = job.skills ? job.skills.split(",").map((s) => s.trim()) : [];
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
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
          <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
          <p className="text-gray-500 text-sm mt-1">
            Posted {formatDate(job.created_at)}
          </p>
        </div>
        {matchScore !== undefined && (
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${
                matchScore >= 80
                  ? "bg-green-100 text-green-700"
                  : matchScore >= 50
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {matchScore}%
            </div>
            <span className="text-xs text-gray-500 mt-1">Match</span>
          </div>
        )}
      </div>

      {job.description && (
        <p className="text-gray-600 mt-3 line-clamp-2">{job.description}</p>
      )}

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {skills.slice(0, 5).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full"
            >
              {skill}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              +{skills.length - 5} more
            </span>
          )}
        </div>
      )}

      <div className="flex justify-end mt-4">
        <Link
          to={`/jobs/${job.id}`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

