import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RiDeleteBinLine } from 'react-icons/ri';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    },
  };
};

const ProgressBar = ({ completed, target }) => {
  const percentage = target > 0 ? Math.min((completed / target) * 100, 100) : 0;
  let color = 'bg-emerald-500';
  if (percentage >= 100) color = 'bg-green-600';
  else if (percentage >= 50) color = 'bg-yellow-400';

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

  const fetchActivities = useCallback(async () => {
    try {
      const res = await axios.get(API_BASE_URL, getAuthConfig());
      const data = res.data?.data || [];
      setActivities(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch {
      toast.error('Could not fetch activities.');
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/summary`, getAuthConfig());
      if (res.data?.data) setSummary(res.data.data);
    } catch {
      toast.error('Could not fetch summary.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchActivities(), fetchSummary()]).finally(() =>
      setLoading(false)
    );
  }, [fetchActivities, fetchSummary]);

  const openModal = (activity) => {
    setSelectedActivity(activity);
    setDurationToAdd('');
    document.getElementById('progress_modal')?.showModal();
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (durationToAdd <= 0)
      return toast.error('Enter a valid number of minutes.');
    setIsModalLoading(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/${selectedActivity._id}`,
        { durationToAdd: Number(durationToAdd) },
        getAuthConfig()
      );
      toast.success('Progress updated!');
      setActivities((prev) =>
        prev.map((a) => (a._id === selectedActivity._id ? res.data.data : a))
      );
      fetchSummary();
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
        fetchActivities();
        fetchSummary();
      } catch {
        toast.error('Failed to delete activity.');
      }
    }
  };

  const filtered = activities.filter((a) => a.taskType === activeTab);

  if (loading)
    return (
      <div className='flex justify-center items-center min-h-screen bg-emerald-50'>
        <span className='loading loading-spinner loading-lg text-emerald-600'></span>
      </div>
    );

  return (
    <>
      <div className='min-h-screen bg-gradient-to-b from-white to-emerald-50 px-6 py-10'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row justify-between items-center mb-10 gap-4'>
            <h1 className='text-4xl font-extrabold text-emerald-700'>
              Activity Tracker
            </h1>
            <button
              onClick={() => navigate('/activities/new')}
              className='p-2 text-white btn btn-primary rounded-xl bg-emerald-600 border-none hover:bg-emerald-700'
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
                className='p-6 bg-white shadow-md rounded-2xl border border-gray-100'
              >
                <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
                  {s.title}
                </h2>
                <p className='text-gray-600 mb-2'>
                  <span className='font-bold text-emerald-600'>
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
                    ? 'tab-active text-emerald-600 font-semibold border-b-2 border-emerald-500'
                    : 'text-gray-500 hover:text-emerald-600'
                }`}
                onClick={() => setActiveTab(t)}
              >
                {t} Tasks
              </a>
            ))}
          </div>

          {/* Table */}
          <div className='overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-100'>
            <table className='table w-full text-gray-700'>
              <thead className='bg-gray-100 text-gray-800'>
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
                    <tr key={a._id} className='hover:bg-emerald-50'>
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
                          className='btn btn-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none'
                        >
                          Log Progress
                        </button>
                        <button
                          onClick={() => handleDelete(a._id)}
                          className='btn btn-sm bg-red-100 text-red-600 hover:bg-red-200 border-none'
                        >
                          <RiDeleteBinLine size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='4' className='text-center py-10 text-gray-500'>
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
        <div className='modal-box rounded-2xl bg-white'>
          <h3 className='font-bold text-lg text-emerald-700 mb-3'>
            Log Progress for{' '}
            <span className='font-semibold'>
              {selectedActivity?.activityName}
            </span>
          </h3>
          <form onSubmit={handleProgressSubmit}>
            <div className='form-control py-4'>
              <label className='label'>
                <span className='label-text'>Minutes to Add:</span>
              </label>
              <input
                type='number'
                placeholder='e.g., 30'
                className='input input-bordered w-full rounded-lg'
                value={durationToAdd}
                onChange={(e) => setDurationToAdd(e.target.value)}
                min='1'
                required
              />
            </div>
            <div className='modal-action'>
              <button
                type='submit'
                className='btn bg-emerald-600 hover:bg-emerald-700 text-white'
                disabled={isModalLoading}
              >
                {isModalLoading ? (
                  <span className='loading loading-spinner'></span>
                ) : (
                  'Update'
                )}
              </button>
              <button
                type='button'
                className='btn border-gray-300 bg-gray-50 hover:bg-gray-100'
                onClick={() =>
                  document.getElementById('progress_modal').close()
                }
              >
                Cancel
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
