import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth.js'; // Import your auth hook

// Helper function to get auth headers dynamically
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
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

// Helper function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ScreenTimeLogger = () => {
  const { user } = useAuth(); // Get user state to trigger re-fetch on login
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    deviceType: 'Mobile', // Default value
    durationMinutes: '',
    date: new Date().toISOString().split('T')[0], // Default to today
  });

  // Fetch all existing logs
  const fetchLogs = useCallback(async () => {
    if (!user) { // Don't fetch if user isn't loaded
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      setLoading(false);
      setError("You must be logged in to view this page.");
      return;
    }

    try {
      const res = await axios.get('http://localhost:3000/api/screentime', authHeaders);
      if (res.data && Array.isArray(res.data.data)) {
        setLogs(res.data.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Error fetching screen time logs:", err);
      setError(err.response?.data?.message || "Could not fetch logs.");
      toast.error(err.response?.data?.message || "Could not fetch logs.");
    } finally {
      setLoading(false);
    }
  }, [user]); // Re-fetch when user object changes

  // Fetch logs on component mount and when user changes
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.deviceType || !formData.durationMinutes || !formData.date) {
      toast.error('Please fill in all fields.');
      setLoading(false);
      return;
    }
    
    if (formData.durationMinutes <= 0) {
      toast.error('Duration must be a positive number.');
      setLoading(false);
      return;
    }

    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;

    try {
      const res = await axios.post('http://localhost:3000/api/screentime', formData, authHeaders);
      if (res.data && res.data.data) {
        toast.success('Screen time logged!');
        // Add new log to the top of the list
        setLogs(prevLogs => [res.data.data, ...prevLogs]); 
        // Clear the form
        setFormData({
          deviceType: 'Mobile',
          durationMinutes: '',
          date: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to log time. Please try again.';
      toast.error(errorMsg);
      console.error('Error submitting screen time:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      {/* Form Card */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center text-primary mb-6">
            Log General Screen Time
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Device Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Device/Usage Type</span>
                </label>
                <select
                  name="deviceType"
                  className="select select-bordered w-full rounded-lg"
                  value={formData.deviceType}
                  onChange={handleChange}
                  required
                >
                  <option value="Mobile">Mobile</option>
                  <option value="Internet">Internet (PC/Laptop)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Duration */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Duration (in minutes)</span>
                </label>
                <input
                  type="number"
                  name="durationMinutes"
                  placeholder="e.g., 120"
                  className="input input-bordered w-full rounded-lg"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              {/* Date */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date</span>
                </label>
                <input
                  type="date"
                  name="date"
                  className="input input-bordered w-full rounded-lg"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full rounded-lg"
                disabled={loading}
              >
                {loading && formData.durationMinutes ? <span className="loading loading-spinner"></span> : 'Log Screen Time'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Log History Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Your Screen Time History</h2>
          <div className="overflow-x-auto max-h-96">
            {loading && logs.length === 0 ? (
              <div className="flex justify-center items-center h-48">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : error ? (
              <div className="text-center text-error py-8">{error}</div>
            ) : logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                You haven't logged any screen time yet.
              </div>
            ) : (
              <table className="table w-full">
                {/* head */}
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Duration</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="hover">
                      <td>
                        <span className="font-bold">{log.deviceType}</span>
                      </td>
                      <td>{log.durationMinutes} minutes</td>
                      <td>{formatDate(log.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ScreenTimeLogger;

