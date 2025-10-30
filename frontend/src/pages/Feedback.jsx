import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error("Authentication token not found. Please log in again.");
    return null; 
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('daily'); 

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);
      const authHeaders = getAuthHeaders();
      
      if (!authHeaders) {
        setLoading(false);
        setError("You are not logged in.");
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/api/activities/feedback', authHeaders);
        
        if (response.data && response.data.data) {
          setFeedback(response.data.data);
        } else {
          console.error("Unexpected feedback data structure:", response.data);
          setError('Failed to get feedback data.');
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        const errorMsg = err.response?.data?.message || 'Could not fetch feedback.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const renderFeedbackSection = (data, title) => {
    if (!data) return null;

    const { 
      overallProgress, 
      message, 
      completedTasks = [], 
      missedTasks = []      
    } = data;

    
    const progress = overallProgress ?? 0;
    
    
    let progressColor = 'progress-success'; 
    if (progress < 50) progressColor = 'progress-error'; 
    else if (progress < 100) progressColor = 'progress-warning'; 

    return (
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">{title}</h2>

          
          <div className="mb-6">
            <h3 className="text-lg font-semibold flex items-center mb-2">
              <span className="mr-2">🏅</span> Your Progress Report
            </h3>
            <p className="mb-3">{message}</p>
            <progress
              className={`progress ${progressColor} w-full`}
              value={progress.toFixed(0)}
              max="100"
            ></progress>
            <p className="text-sm text-right font-medium mt-1">{progress.toFixed(0)}% Complete</p>
          </div>

          
          {completedTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center mb-2">
                <span className="mr-2">✅</span> Congratulations!
              </h3>
              <p>You successfully completed the following tasks:</p>
              <ul className="list-disc list-inside mt-2 text-success">
                {completedTasks.map((task) => (
                  <li key={task._id}>{task.activityName}</li>
                ))}
              </ul>
            </div>
          )}

         
          {missedTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-2">
                <span className="mr-2">⚠️</span> Missed Deadlines
              </h3>
              <p>Looks like you missed the deadline for these tasks:</p>
              <ul className="list-disc list-inside mt-2 text-error">
                {missedTasks.map((task) => (
                  <li key={task._id}>{task.activityName} (Target: {task.targetMinutes} mins)</li>
                ))}
              </ul>
            </div>
          )}

         
          {completedTasks.length === 0 && missedTasks.length === 0 && (
             <div className="text-center p-4 bg-base-200 rounded-lg">
                <span className="mx-auto text-3xl text-gray-400 mb-2">🚩</span>
                <h3 className="font-semibold">No Tasks Found</h3>
                <p className="text-sm text-gray-500">You did not have any {title.toLowerCase()} scheduled for the last period. Set some new goals!</p>
             </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center text-red-500">
          <p className="text-2xl font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl"> 
      <Toaster position="top-right" />
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        Your Feedback
      </h1>

      <div className="tabs tabs-boxed mb-6">
        <a
          className={`tab tab-lg ${tab === 'daily' ? 'tab-active' : ''}`}
          onClick={() => setTab('daily')}
        >
          Daily Feedback
        </a>
        <a
          className={`tab tab-lg ${tab === 'weekly' ? 'tab-active' : ''}`}
          onClick={() => setTab('weekly')}
        >
          Weekly Feedback
        </a>
      </div>

     
      {tab === 'daily'
        ? renderFeedbackSection(feedback?.daily, 'Daily Report')
        : renderFeedbackSection(feedback?.weekly, 'Weekly Report')}
    </div>
  );
};

export default FeedbackPage;

