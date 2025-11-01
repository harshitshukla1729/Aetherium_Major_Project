import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

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
        setError('You are not logged in.');
        return;
      }

      try {
        const response = await axios.get(
          'http://localhost:3000/api/activities/feedback',
          authHeaders
        );

        if (response.data && response.data.data) {
          setFeedback(response.data.data);
        } else {
          setError('Failed to get feedback data.');
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || 'Could not fetch feedback.';
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

        {/* Missed Tasks */}
        {missedTasks.length > 0 && (
          <div>
            <h3 className='text-lg font-medium text-red-700 flex items-center mb-2'>
              <span className='mr-2'>⚠️</span> Missed Deadlines
            </h3>
            <p className='text-gray-600'>
              Looks like you missed the deadline for these tasks:
            </p>
            <ul className='list-disc list-inside mt-2 text-red-600'>
              {missedTasks.map((task) => (
                <li key={task._id}>
                  {task.activityName} (Target: {task.targetMinutes} mins)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* No Tasks */}
        {completedTasks.length === 0 && missedTasks.length === 0 && (
          <div className='text-center p-6 bg-gray-50 rounded-xl border border-gray-200'>
            <div className='text-4xl mb-2'>🚩</div>
            <h3 className='font-semibold text-gray-700'>No Tasks Found</h3>
            <p className='text-sm text-gray-500'>
              You did not have any {title.toLowerCase()} scheduled. Set some new
              goals!
            </p>
          </div>
        )}
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

      {tab === 'daily'
        ? renderFeedbackSection(feedback?.daily, 'Daily Report')
        : renderFeedbackSection(feedback?.weekly, 'Weekly Report')}
    </div>
  );
};

export default FeedbackPage;
