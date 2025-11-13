import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import useAuth from "./hooks/useAuth";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Tasks from "./pages/Tasks";
import FeedbackPage from "./pages/Feedback";
import ActivityTracker from "./pages/ActivityTracker";
import ActivityForm from "./pages/ActivityForm";
import AgentSurvey from "./pages/AgentSurvey";
import ScreenTimeLogger from "./pages/ScreenTimeLogger";
import Planner from "./pages/Planner";
import Survey from "./pages/Survey";

function App() {
  const { user, setUser, logout } = useAuth();

  // 🧠 A protected route wrapper
  const Protected = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;
    return children;
  };

  // 🧠 A redirect wrapper (for logged-in users)
  const RedirectIfLoggedIn = ({ children }) => {
    const token = localStorage.getItem("token");
    if (token) return <Navigate to="/tasks" replace />;
    return children;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogout={logout} />

      <div className="container mx-auto mt-6">
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          {/* 👇 Home - only for guests */}
          <Route
            path="/"
            element={
              <RedirectIfLoggedIn>
                <Home user={user} />
              </RedirectIfLoggedIn>
            }
          />

          {/* 👇 Auth routes - redirect if already logged in */}
          <Route
            path="/login"
            element={
              <RedirectIfLoggedIn>
                <Login setUser={setUser} />
              </RedirectIfLoggedIn>
            }
          />

          <Route
            path="/signup"
            element={
              <RedirectIfLoggedIn>
                <Signup setUser={setUser} />
              </RedirectIfLoggedIn>
            }
          />

          {/* 👇 Password recovery routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* 👇 Protected routes (require login) */}
          <Route
            path="/tasks"
            element={
              <Protected>
                <Tasks />
              </Protected>
            }
          />

          <Route
            path="/activities"
            element={
              <Protected>
                <ActivityTracker />
              </Protected>
            }
          />

          <Route
            path="/activities/new"
            element={
              <Protected>
                <ActivityForm />
              </Protected>
            }
          />

          <Route
            path="/feedback"
            element={
              <Protected>
                <FeedbackPage />
              </Protected>
            }
          />

          <Route
            path="/planner"
            element={
              <Protected>
                <Planner />
              </Protected>
            }
          />

          <Route
            path="/screen-time"
            element={
              <Protected>
                <ScreenTimeLogger />
              </Protected>
            }
          />

          <Route
            path="/agent-survey"
            element={
              <Protected>
                <AgentSurvey />
              </Protected>
            }
          />

          {/* 👇 Public Survey */}
          <Route path="/survey" element={<Survey />} />

          {/* 👇 Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Toaster />
    </div>
  );
}

export default App;
