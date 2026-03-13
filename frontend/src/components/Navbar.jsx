import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xl font-bold">MatchHire AI</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg hover:bg-indigo-500 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {user?.role === "candidate" && (
                  <>
                    <Link
                      to="/jobs"
                      className="px-3 py-2 rounded-lg hover:bg-indigo-500 transition"
                    >
                      Browse Jobs
                    </Link>
                    <Link
                      to="/profile"
                      className="px-3 py-2 rounded-lg hover:bg-indigo-500 transition"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/applications"
                      className="px-3 py-2 rounded-lg hover:bg-indigo-500 transition"
                    >
                      My Applications
                    </Link>
                  </>
                )}
                {user?.role === "recruiter" && (
                  <>
                    <Link
                      to="/recruiter/dashboard"
                      className="px-3 py-2 rounded-lg hover:bg-indigo-500 transition"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/post-job"
                      className="px-3 py-2 rounded-lg hover:bg-indigo-500 transition"
                    >
                      Post Job
                    </Link>
                    <Link
                      to="/recruiter/candidates"
                      className="px-3 py-2 rounded-lg hover:bg-indigo-500 transition"
                    >
                      Candidates
                    </Link>
                  </>
                )}
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-sm text-indigo-200">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-indigo-700 rounded-lg hover:bg-indigo-800 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

