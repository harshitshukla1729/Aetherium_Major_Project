import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth.js';

// Helper: Get Authorization Headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('Authentication token not found. Please log in again.');
    return null;
  }
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Helper: Format Date
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const ScreenTimeLogger = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    deviceType: 'Mobile',
    durationMinutes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      setLoading(false);
      setError('You must be logged in to view this page.');
      return;
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/screentime`, authHeaders);
      setLogs(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error('Error fetching screen time logs:', err);
      setError(err.response?.data?.message || 'Could not fetch logs.');
      toast.error(err.response?.data?.message || 'Could not fetch logs.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deviceType || !formData.durationMinutes || !formData.date) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (formData.durationMinutes <= 0) {
      toast.error('Duration must be a positive number.');
      return;
    }

    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_FRONTEND_URL}/api/screentime`, formData, authHeaders);
      if (res.data?.data) {
        toast.success('Screen time logged!');
        setLogs((prev) => [res.data.data, ...prev]);
        setFormData({
          deviceType: 'Mobile',
          durationMinutes: '',
          date: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
          📱 Screen Time Logger
        </h1>

        {/* Input Form */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
            Log Your Screen Time
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Device */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Device Type
              </label>
              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="Mobile">Mobile</option>
                <option value="Internet">Internet (PC/Laptop)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                placeholder="e.g., 120"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                min="1"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-3 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-semibold transition-all duration-200"
              >
                {loading ? 'Logging...' : 'Log Screen Time'}
              </button>
            </div>
          </form>
        </div>

        {/* Logs Table */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
            Screen Time History
          </h2>

          {loading && logs.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <span className="loading loading-spinner text-blue-500"></span>
            </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-gray-500">No screen time logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-100 rounded-lg">
                <thead className="bg-blue-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Device</th>
                    <th className="px-4 py-2 font-semibold">Duration</th>
                    <th className="px-4 py-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-t hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 py-2 font-medium text-gray-700">
                        {log.deviceType}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {log.durationMinutes} min
                      </td>
                      <td className="px-4 py-2 text-gray-600">{formatDate(log.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenTimeLogger;
