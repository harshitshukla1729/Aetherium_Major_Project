import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Toaster } from "react-hot-toast";
import FeedbackPage from './pages/Feedback';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Survey from './pages/Survey';
import useAuth from './hooks/useAuth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Tasks from './pages/Tasks';
import ActivityTracker from './pages/ActivityTracker'; 
import ActivityForm from './pages/ActivityForm'; 
import AgentSurvey from './pages/AgentSurvey.jsx';
import ScreenTimeLogger from './pages/ScreenTimeLogger.jsx'
import Planner from './pages/Planner';
function App() {
  const { user, setUser, logout } = useAuth();

  const Protected = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to='/login' />;
    return children;
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <Navbar user={user} onLogout={logout} />
      <div className='container mx-auto mt-6'>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path='/' element={<Home user={user}/>} />
          <Route path='/login' element={<Login setUser={setUser} />} />
          <Route path='/signup' element={<Signup setUser={setUser} />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password/:token' element={<ResetPassword />} />
          <Route
            path='/tasks'
            element={
              <Protected>
                <Tasks />
              </Protected>
            }
          />
          <Route
            path='/survey'
            element={
                <Survey />
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
            path="/planner"
            element={
              <Protected>
                <Planner />
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
        </Routes>
      </div>
       <Toaster />
    </div>
  );
}

export default App;
