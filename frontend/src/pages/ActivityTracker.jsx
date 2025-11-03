import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('Please log in again.');
    return null;
  }
  return { headers: { Authorization: `Bearer ${token}` } };
};

const ProgressBar = ({ completed, target }) => {
  const percent = target > 0 ? Math.min((completed / target) * 100, 100) : 0;
  const color =
    percent < 50 ? 'bg-blue-300' : percent < 100 ? 'bg-yellow-400' : 'bg-blue-500';
  return (
    <div className="w-full bg-gray-200 h-2 rounded-full">
      <div
        className={`${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
};

export default function ActivityTracker() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const API = 'http://localhost:3000/api/activities';

  const fetchData = useCallback(async () => {
    if (!user) return;
    const auth = getAuthConfig();
    if (!auth) return;
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([
        axios.get(API, auth),
        axios.get(`${API}/summary`, auth),
      ]);
      setActivities(aRes.data?.data || []);
      setSummary(sRes.data?.data || summary);
    } catch {
      toast.error('Error fetching data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = (a) => {
    setSelectedActivity(a);
    setDurationToAdd('');
    document.getElementById('progress_modal').showModal();
  };

  const updateProgress = async (e) => {
    e.preventDefault();
    const minutes = Number(durationToAdd);
    if (minutes <= 0) return toast.error('Enter valid minutes.');
    setIsModalLoading(true);
    try {
      await axios.patch(`${API}/${selectedActivity._id}`, { minutesToAdd: minutes }, getAuthConfig());
      toast.success('Progress updated.');
      fetchData();
      document.getElementById('progress_modal').close();
    } catch {
      toast.error('Failed to update.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const deleteActivity = async (id) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await axios.delete(`${API}/${id}`, getAuthConfig());
      toast.success('Deleted.');
      fetchData();
    } catch {
      toast.error('Delete failed.');
    }
  };

  const filtered = activities.filter((a) => a.taskType === activeTab);
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <span className="loading loading-spinner loading-lg text-blue-500"></span>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-blue-600">Activity Tracker</h1>
          <button
            onClick={() => navigate('/activities/new')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition"
          >
            + Add Activity
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {[
            { title: 'Daily Progress', data: summary.daily },
            { title: 'Weekly Progress', data: summary.weekly },
          ].map((s) => (
            <div key={s.title} className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">{s.title}</h2>
              <p className="text-gray-600 mb-2">
                <span className="font-bold text-blue-600">{s.data.totalCompleted}</span> /{' '}
                {s.data.totalTarget} min
              </p>
              <ProgressBar completed={s.data.totalCompleted} target={s.data.totalTarget} />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {['Daily', 'Weekly'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2 text-sm font-semibold border-b-2 transition ${
                activeTab === t
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
            >
              {t} Tasks
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="table w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Activity</th>
                <th className="py-3 px-4 text-left">Progress</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((a) => (
                  <tr key={a._id} className="hover:bg-blue-50">
                    <td className="py-3 px-4 font-medium">{a.activityName}</td>
                    <td className="py-3 px-4">
                      {a.durationMinutes}/{a.targetMinutes} min
                      <ProgressBar completed={a.durationMinutes} target={a.targetMinutes} />
                    </td>
                    <td className="py-3 px-4">{formatDate(a.date)}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => openModal(a)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm"
                      >
                        Log Progress
                      </button>
                      <button
                        onClick={() => deleteActivity(a._id)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded-lg"
                      >
                        <RiDeleteBinLine size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500">
                    No {activeTab.toLowerCase()} activities logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <dialog id="progress_modal" className="modal">
        <div className="modal-box bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">
            Log Progress – {selectedActivity?.activityName}
          </h3>
          <form onSubmit={updateProgress}>
            <label className="block text-gray-700 mb-2">Minutes to Add:</label>
            <input
              type="number"
              min="1"
              value={durationToAdd}
              onChange={(e) => setDurationToAdd(e.target.value)}
              className="input input-bordered w-full rounded-lg mb-4"
              placeholder="e.g., 30"
              required
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                onClick={() => document.getElementById('progress_modal').close()}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isModalLoading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                {isModalLoading ? <span className="loading loading-spinner"></span> : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
