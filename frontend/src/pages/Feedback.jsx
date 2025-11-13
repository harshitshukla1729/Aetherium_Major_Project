import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../hooks/useAuth.js';

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
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/activities/feedback`,
        authHeaders
      );
      if (response.data && response.data.data) {
        setFeedback(response.data.data);
      } else {
        console.error("Unexpected feedback data:", response.data);
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

  // Progress Section
  const renderProgressSection = (data, title) => {
    if (!data || !data.progress) return null;

    const {
      overallProgress = 0,
      message = "No progress data available.",
      completedTasks = [],
      missedTasks = [],
      totalTarget = 0,
    } = data.progress;

    let progressColor = 'progress-success';
    if (overallProgress < 50) progressColor = 'progress-error';
    else if (overallProgress < 100) progressColor = 'progress-warning';

    if (totalTarget === 0) {
      return (
        <div className="bg-white shadow-md rounded-xl mb-6 border border-gray-200">
          <div className="p-6 text-center">
            <span className="text-4xl mb-2 block">🚩</span>
            <h2 className="text-xl font-semibold mb-1">{title} Progress</h2>
            <p className="text-gray-500 text-sm">
              You haven't set any {tab} goals yet. Go to the Activity Tracker to add some!
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white shadow-md rounded-xl mb-6 border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {title} Progress
        </h2>

        {/* Progress Report */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 flex items-center mb-2">
            <span className="mr-2">🏅</span> Your Progress Report
          </h3>
          <p className="text-gray-600 mb-3">{message}</p>
          <progress
            className={`progress ${progressColor} w-full h-3 rounded-full`}
            value={overallProgress.toFixed(0)}
            max="100"
          ></progress>
          <p className="text-sm text-right text-gray-500 mt-1">
            {overallProgress.toFixed(0)}% Complete
          </p>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-green-700 flex items-center mb-2">
              <span className="mr-2">✅</span> Great Job!
            </h3>
            <p className="text-gray-600">
              You successfully completed the following tasks:
            </p>
            <ul className="list-disc list-inside mt-2 text-green-600">
              {completedTasks.map((task) => (
                <li key={task._id}>{task.activityName}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Missed Tasks */}
        {missedTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold flex items-center mb-2 text-yellow-600">
              <span className="mr-2 text-xl">⚠️</span> Missed Deadlines
            </h3>
            <p className="text-gray-600">
              You missed deadlines for these tasks:
            </p>
            <ul className="list-disc list-inside mt-2 text-red-500">
              {missedTasks.map((task) => (
                <li key={task._id}>
                  {task.activityName} (Target: {task.targetMinutes} mins)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Screen Time Report
  const renderScreenTimeSection = (data) => {
    if (!data || !data.screenTime) return null;

    const { totalScreenTime = 0, byType = {} } = data.screenTime;
    const types = Object.keys(byType);

    return (
      <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Screen Time Report
        </h2>
        {totalScreenTime === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <span className="text-3xl mb-2 block text-gray-400">📱</span>
            <h3 className="font-semibold text-gray-700">No Screen Time Logged</h3>
            <p className="text-sm text-gray-500">
              You haven't logged any general screen time for this period.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 text-lg mb-4">
              You've logged a total of{' '}
              <strong className="text-blue-600">
                {Math.floor(totalScreenTime / 60)}h {totalScreenTime % 60}m
              </strong>{' '}
              of screen time.
            </p>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Breakdown:</h3>
            <ul className="list-disc list-inside text-gray-600">
              {types.map((type) => (
                <li key={type}>
                  <strong>{type}:</strong> {byType[type]} minutes
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] bg-gray-50">
        <span className="loading loading-spinner loading-lg text-blue-500"></span>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] bg-gray-50">
        <div className="text-center text-red-600">
          <p className="text-2xl font-bold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <Toaster position="top-right" />
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Your Feedback
      </h1>

      <div className="flex justify-center mb-8">
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl flex overflow-hidden">
          <button
            className={`px-6 py-3 font-medium transition-colors duration-200 ${
              tab === 'daily'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setTab('daily')}
          >
            Daily Feedback
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors duration-200 ${
              tab === 'weekly'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setTab('weekly')}
          >
            Weekly Feedback
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
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
    </div>
  );
};

export default FeedbackPage;
