import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"

import Landing from "./pages/Landing"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import CandidateDashboard from "./pages/CandidateDashboard"
import JobListings from "./pages/JobListings"
import Profile from "./pages/Profile"
import MyApplications from "./pages/MyApplications"
import RecruiterDashboard from "./pages/RecruiterDashboard"
import PostJob from "./pages/PostJob"
import ViewApplicants from "./pages/ViewApplicants"
import CandidateSearch from "./pages/CandidateSearch"

// Protected Route Component
function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === "recruiter" ? "/recruiter/dashboard" : "/jobs"} replace />
  }
  
  return children
}

// Redirect based on role
function RoleRedirect() {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role === "recruiter") {
    return <Navigate to="/recruiter/dashboard" replace />
  }
  
  return <Navigate to="/jobs" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      
      {/* Candidate Routes */}
      <Route 
        path="/jobs" 
        element={
          <ProtectedRoute allowedRole="candidate">
            <JobListings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRole="candidate">
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/applications" 
        element={
          <ProtectedRoute allowedRole="candidate">
            <MyApplications />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRole="candidate">
            <CandidateDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Recruiter Routes */}
      <Route 
        path="/recruiter/dashboard" 
        element={
          <ProtectedRoute allowedRole="recruiter">
            <RecruiterDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/post-job" 
        element={
          <ProtectedRoute allowedRole="recruiter">
            <PostJob />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/recruiter/applicants/:jobId" 
        element={
          <ProtectedRoute allowedRole="recruiter">
            <ViewApplicants />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/recruiter/candidates" 
        element={
          <ProtectedRoute allowedRole="recruiter">
            <CandidateSearch />
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

