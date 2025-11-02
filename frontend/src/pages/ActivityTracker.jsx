import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RiDeleteBinLine } from 'react-icons/ri'; // Using Remix Icons
import useAuth from '../hooks/useAuth'; // Using correct relative path

// Helper function to get auth headers dynamically
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error("Authentication token not found. Please log in again.");
    return null; 
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    },
  };
};

// Custom ProgressBar component from your design
const ProgressBar = ({ completed, target }) => {
  const percentage = target > 0 ? Math.min((completed / target) * 100, 100) : 0;
  let color = 'bg-emerald-500'; // Default color
  if (percentage < 50) color = 'bg-red-400';
  else if (percentage < 100) color = 'bg-yellow-400';
  else color = 'bg-green-600'; // Complete

  return (
    <div className='w-full bg-gray-200 rounded-full h-2 mt-1'>
      <div
        className={`${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const ActivityTracker = () => {
  const { user } = useAuth(); // Get user state
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({
    daily: { totalCompleted: 0, totalTarget: 0 },
    weekly: { totalCompleted: 0, totalTarget: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Daily');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [durationToAdd, setDurationToAdd] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:3000/api/activities';

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  // Combined fetch function
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return; // Don't fetch if no user
    }
    
    setLoading(true);
    const authConfig = getAuthConfig();
    if (!authConfig) {
      setLoading(false);
      return;
    }

    try {
      const [activitiesRes, summaryRes] = await Promise.all([
        axios.get(API_BASE_URL, authConfig),
        axios.get(`${API_BASE_URL}/summary`, authConfig)
      ]);

      const activitiesData = activitiesRes.data?.data || [];
      setActivities(activitiesData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      
      if (summaryRes.data?.data) {
        setSummary(summaryRes.data.data);
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error('Could not fetch data. Please log in again.');
    } finally {
      setLoading(false);
    }
  }, [user]); // Add user as dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Run when fetchData function is stable

  const openModal = (activity) => {
    setSelectedActivity(activity);
    setDurationToAdd('');
    document.getElementById('progress_modal')?.showModal();
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    const numericDuration = Number(durationToAdd);
    if (numericDuration <= 0 || isNaN(numericDuration)) {
      return toast.error('Enter a valid number of minutes.');
    }
      
    setIsModalLoading(true);
    try {
      // Backend logic updates all matching tasks, so we must re-fetch
      await axios.patch(
        `${API_BASE_URL}/${selectedActivity._id}`,
        { minutesToAdd: numericDuration },
        getAuthConfig()
      );
      
      toast.success('Progress updated!');
      
      // Re-fetch all data to show synced progress
      await fetchData(); 
      
      document.getElementById('progress_modal')?.close();
    } catch {
      toast.error('Failed to update progress.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this activity?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`, getAuthConfig());
        toast.success('Deleted successfully.');
        // Re-fetch data to update UI
        fetchData();
      } catch {
        toast.error('Failed to delete activity.');
      }
    }
  };

  const filtered = activities.filter((a) => a.taskType === activeTab);

  if (loading && activities.length === 0) // Only show full-page loader on initial load
    return (
      <div className='flex justify-center items-center min-h-screen bg-emerald-50'>
        <span className='loading loading-spinner loading-lg text-emerald-600'></span>
      </div>
    );

  return (
    <>
      <div className='min-h-screen bg-gradient-to-b from-white to-emerald-50 px-6 py-10 dark:from-slate-900 dark:to-slate-800'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row justify-between items-center mb-10 gap-4'>
            <h1 className='text-4xl font-extrabold text-emerald-700 dark:text-emerald-400'>
              Activity Tracker
            </h1>
            <button
              onClick={() => navigate('/activities/new')}
              className='p-2 text-white btn btn-primary rounded-xl bg-emerald-600 border-none hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
            >
              + Log New Activity
            </button>
          </div>

          {/* Summary */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-10'>
            {[
              { title: 'Daily Progress', data: summary.daily },
              { title: 'Weekly Progress', data: summary.weekly },
            ].map((s) => (
              <div
                key={s.title}
                className='p-6 bg-white shadow-md rounded-2xl border border-gray-100 dark:bg-slate-800 dark:border-slate-700'
              >
                <h2 className='text-2xl font-semibold text-gray-800 dark:text-white mb-2'>
                  {s.title}
                </h2>
                <p className='text-gray-600 dark:text-gray-300 mb-2'>
                  <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                    {s.data.totalCompleted}
                  </span>{' '}
                  / {s.data.totalTarget} min
                </p>
                <ProgressBar
                  completed={s.data.totalCompleted}
                  target={s.data.totalTarget}
                />
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div role='tablist' className='tabs tabs-lifted tabs-lg mb-6'>
            {['Daily', 'Weekly'].map((t) => (
              <a
                key={t}
                role='tab'
                className={`tab ${
                  activeTab === t
                    ? 'tab-active text-emerald-600 dark:text-emerald-400 font-semibold [--tab-bg:white] dark:[--tab-bg:rgb(30,41,59)]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
                onClick={() => setActiveTab(t)}
              >
                {t} Tasks
              </a>
            ))}
             {/* This is a visual spacer to complete the tab-lifted look */}
            <a role="tab" className="tab flex-1 cursor-default"></a>
          </div>

          {/* Table */}
          <div className='overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700'>
            <table className='table w-full text-gray-700 dark:text-gray-300'>
              <thead className='bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'>
                <tr>
                  <th>Activity</th>
                  <th>Progress</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((a) => (
                    <tr key={a._id} className='hover:bg-emerald-50 dark:hover:bg-slate-700'>
                      <td className='font-medium text-lg'>{a.activityName}</td>
                      <td>
                        <span className='font-semibold'>
                          {a.durationMinutes}
                        </span>{' '}
                        / {a.targetMinutes}
                        <ProgressBar
                          completed={a.durationMinutes}
                          target={a.targetMinutes}
                        />
                      </td>
                      <td>{formatDate(a.date)}</td>
                      <td className='flex flex-col sm:flex-row gap-2'>
                        <button
                          onClick={() => openModal(a)}
                          className='btn btn-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none dark:bg-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-700'
                        >
                          Log Progress
                        </button>
                        <button
                          onClick={() => handleDelete(a._id)}
                          className='btn btn-sm bg-red-100 text-red-600 hover:bg-red-200 border-none dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700'
                        >
                          <RiDeleteBinLine size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='4' className='text-center py-10 text-gray-500 dark:text-gray-400'>
                      No {activeTab.toLowerCase()} activities logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <dialog id='progress_modal' className='modal'>
        <div className='modal-box rounded-2xl bg-white dark:bg-slate-800'>
          <h3 className='font-bold text-lg text-emerald-700 dark:text-emerald-400 mb-3'>
            Log Progress for{' '}
            <span className='font-semibold'>
              {selectedActivity?.activityName}
            </span>
          </h3>
          <form onSubmit={handleProgressSubmit}>
            <div className='form-control py-4'>
              <label className='label'>
                <span className='label-text dark:text-gray-300'>Minutes to Add:</span>
              </label>
              <input
                type='number'
                placeholder='e.g., 30'
                className='input input-bordered w-full rounded-lg dark:bg-slate-700 dark:border-slate-600'
                value={durationToAdd}
                onChange={(e) => setDurationToAdd(e.target.value)}
                min='1'
                required
              />
            </div>
            <div className='modal-action'>
              <button
                type='button'
                className='btn border-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600'
                onClick={() =>
                  document.getElementById('progress_modal').close()
                }
              >
                Cancel
              </button>
              <button
                type='submit'
                className='btn bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600'
                disabled={isModalLoading}
              >
                {isModalLoading ? (
                  <span className='loading loading-spinner'></span>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </form>
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default ActivityTracker;

