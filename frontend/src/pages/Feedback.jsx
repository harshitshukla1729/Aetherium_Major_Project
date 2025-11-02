import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '/src/hooks/useAuth.js'; 
// 🏅 ✅ ⚠️ 🚩 📱 💻 🌐

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('Authentication token not found. Please log in again.');
    return null;
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const FeedbackPage = () => {
  const { user } = useAuth(); 
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('daily');
  const fetchFeedback = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError("Please log in to view feedback.");
      return;
    }
    
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
  }, [user]); 

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const renderFeedbackSection = (data, title) => {
    if (!data) return null;
    const {
      overallProgress,
      message,
      completedTasks = [],
      missedTasks = [],
    } = data;

    const progress = overallProgress ?? 0;
    let progressColor = 'progress-success';
    if (progress < 50) progressColor = 'progress-error';
    else if (progress < 100) progressColor = 'progress-warning';

    return (
      <div className='bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8 transition-all hover:shadow-lg'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>{title}</h2>

        {/* Progress Section */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium text-gray-700 flex items-center mb-2'>
            <span className='mr-2'>🏅</span> Your Progress Report
          </h3>
          <p className='text-gray-600 mb-3'>{message}</p>
          <progress
            className={`progress ${progressColor} w-full h-3 rounded-full`}
            value={progress.toFixed(0)}
            max='100'
          ></progress>
          <p className='text-sm text-right text-gray-500 mt-1'>
            {progress.toFixed(0)}% Complete
          </p>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className='mb-6'>
            <h3 className='text-lg font-medium text-green-700 flex items-center mb-2'>
              <span className='mr-2'>✅</span> Great Job!
            </h3>
            <p className='text-gray-600'>
              You successfully completed the following tasks:
            </p>
            <ul className='list-disc list-inside mt-2 text-green-600'>
              {completedTasks.map((task) => (
                <li key={task._id}>{task.activityName}</li>
              ))}
            </ul>
          </div>
        )}

          {/* Completed Tasks Section (Safe: defaults to []) */}
          {completedTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center mb-2">
                <span className="mr-2 text-xl">✅</span> Congratulations!
              </h3>
              <p>You successfully completed the following tasks:</p>
              <ul className="list-disc list-inside mt-2 text-success">
                {completedTasks.map((task) => (
                  <li key={task._id}>{task.activityName}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Missed Tasks Section (Safe: defaults to []) */}
          {missedTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-2">
                <span className="mr-2 text-xl">⚠️</span> Missed Deadlines
              </h3>
              <p>Looks like you missed the deadline for these tasks:</p>
              <ul className="list-disc list-inside mt-2 text-error">
                {missedTasks.map((task) => (
                  <li key={task._id}>{task.activityName} (Target: {task.targetMinutes} mins)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Renders the "Screen Time Report" card
  const renderScreenTimeSection = (data) => {
    // Fix: Check if data or data.screenTime exists
    if (!data || !data.screenTime) return null;

    const { totalScreenTime = 0, byType = {} } = data.screenTime;
    const types = Object.keys(byType);

    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Screen Time Report</h2>
          {totalScreenTime === 0 ? (
            <div className="text-center p-4 bg-base-200 rounded-lg">
              <span className="mx-auto text-3xl text-gray-400 mb-2">📱</span>
              <h3 className="font-semibold">No Screen Time Logged</h3>
              <p className="text-sm text-gray-500">You haven't logged any general screen time for this period.</p>
            </div>
          ) : (
            <div>
              <p className="text-lg mb-4">You've logged a total of <strong className="text-primary">{Math.floor(totalScreenTime / 60)}h {totalScreenTime % 60}m</strong> of screen time.</p>
              <h3 className="font-semibold mb-2">Breakdown:</h3>
              <ul className="list-disc list-inside">
                {types.map(type => (
                  <li key={type}><strong>{type}:</strong> {byType[type]} minutes</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className='flex justify-center items-center min-h-[calc(100vh-200px)]'>
        <span className='loading loading-spinner loading-lg text-primary'></span>
      </div>
    );

  if (error)
    return (
      <div className='flex justify-center items-center min-h-[calc(100vh-200px)]'>
        <div className='text-center text-red-600'>
          <p className='text-2xl font-bold mb-2'>Error</p>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    <div className='container mx-auto p-6 md:p-10 max-w-4xl bg-gray-50 min-h-screen rounded-xl'>
      <Toaster position='top-right' />
      <h1 className='text-4xl font-bold text-center mb-8 text-gray-800'>
        Your Feedback
      </h1>

      <div className='tabs tabs-boxed bg-white shadow-sm mb-8 border border-gray-200 rounded-xl'>
        <a
          className={`tab tab-lg font-medium ${
            tab === 'daily'
              ? 'tab-active text-blue-600 bg-blue-50'
              : 'text-gray-600'
          }`}
          onClick={() => setTab('daily')}
        >
          Daily Feedback
        </a>
        <a
          className={`tab tab-lg font-medium ${
            tab === 'weekly'
              ? 'tab-active text-blue-600 bg-blue-50'
              : 'text-gray-600'
          }`}
          onClick={() => setTab('weekly')}
        >
          Weekly Feedback
        </a>
      </div>

      {/* Render content based on the active tab */}
      {tab === 'daily' && (
        <>
          {renderProgressSection(feedback?.daily, 'Daily')}
          {renderScreenTimeSection(feedback?.daily)}
        </>
      )}
      {tab === 'weekly' && (
        <>
          {renderProgressSection(feedback?.weekly, 'Weekly')}
          {renderScreenTimeSection(feedback?.weekly)}
        </>
      )}
    </div>
  );
};

export default FeedbackPage;
