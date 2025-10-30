import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RiDeleteBinLine } from "react-icons/ri"; 

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  };
};


const ProgressBar = ({ completed, target }) => {
  const percentage = target > 0 ? Math.min((completed / target) * 100, 100) : 0;
  
  let progressBarColor = 'bg-primary'; 
  if (percentage >= 100) {
    progressBarColor = 'bg-success'; 
  } else if (percentage >= 50) {
    progressBarColor = 'bg-warning'; 
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div 
        className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};


const ActivityTracker = () => {
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({ daily: { totalCompleted: 0, totalTarget: 0 }, weekly: { totalCompleted: 0, totalTarget: 0 } });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Daily');
  
  
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [durationToAdd, setDurationToAdd] = useState(''); 
  const [isModalLoading, setIsModalLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:3000/api/activities';

  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  
  const fetchActivities = useCallback(async () => {
    try {
      const config = getAuthConfig();
      const response = await axios.get(API_BASE_URL, config);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        
        const sortedActivities = response.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setActivities(sortedActivities);
      } else {
        console.error("Received unexpected data structure:", response.data);
        toast.error('Could not parse activity data.');
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error(error.response?.data?.message || "Could not fetch activities.");
    }
  }, []);

  
  const fetchSummary = useCallback(async () => {
    try {
      const config = getAuthConfig();
      const response = await axios.get(`${API_BASE_URL}/summary`, config);
      if (response.data && response.data.data) {
        setSummary(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
      toast.error(error.response?.data?.message || "Could not fetch summary.");
    }
  }, []);

  
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchActivities(), fetchSummary()]).finally(() => setLoading(false));
  }, [fetchActivities, fetchSummary]);

 
  const openProgressModal = (activity) => {
    setSelectedActivity(activity);
    setDurationToAdd(''); 
    const modal = document.getElementById('progress_modal');
    if (modal) modal.showModal();
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (durationToAdd <= 0) {
      toast.error("Please enter a positive number of minutes.");
      return;
    }

    setIsModalLoading(true);

    try {
      const config = getAuthConfig();
      const response = await axios.patch(
        `${API_BASE_URL}/${selectedActivity._id}`, 
        { durationToAdd: Number(durationToAdd) },
        config 
      );
      
      if (response.data && response.data.data) {
        toast.success("Progress updated!");
        
        
        setActivities(prev => 
          prev.map(act => 
            act._id === selectedActivity._id ? response.data.data : act
          )
        );
        
        
        fetchSummary();
        
       
        const modal = document.getElementById('progress_modal');
        if (modal) modal.close();
        setSelectedActivity(null);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update progress.';
      toast.error(errorMessage);
      console.error("Error updating progress:", error);
    } finally {
      setIsModalLoading(false);
    }
  };


  const handleDelete = async (id) => {
   
    if (window.confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      try {
        const config = getAuthConfig();
        await axios.delete(`${API_BASE_URL}/${id}`, config);
        toast.success('Activity deleted!');
       
        fetchActivities();
        fetchSummary();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete activity.';
        toast.error(errorMessage);
        console.error("Error deleting activity:", error);
      }
    }
  };

  const filteredActivities = activities.filter(act => act.taskType === activeTab);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4 min-h-screen" data-theme="emerald">
      
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-4xl font-bold text-primary text-center sm:text-left">Activity Tracker</h1>
          <button onClick={() => navigate('/activities/new')} className="btn btn-primary w-full sm:w-auto">
            + Log New Activity
          </button>
        </div>

       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl">Daily Progress</h2>
              <p className="text-lg font-semibold">{summary.daily.totalCompleted} / {summary.daily.totalTarget} <span className="text-sm font-normal">minutes</span></p>
              <ProgressBar completed={summary.daily.totalCompleted} target={summary.daily.totalTarget} />
            </div>
          </div>
        
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl">Weekly Progress</h2>
              <p className="text-lg font-semibold">{summary.weekly.totalCompleted} / {summary.weekly.totalTarget} <span className="text-sm font-normal">minutes</span></p>
              <ProgressBar completed={summary.weekly.totalCompleted} target={summary.weekly.totalTarget} />
            </div>
          </div>
        </div>

       
        <div role="tablist" className="tabs tabs-lifted tabs-lg mb-4">
          <a 
            role="tab" 
            className={`tab ${activeTab === 'Daily' ? 'tab-active font-bold' : ''}`} 
            onClick={() => setActiveTab('Daily')}
          >
            Daily Tasks
          </a>
          <a 
            role="tab" 
            className={`tab ${activeTab === 'Weekly' ? 'tab-active font-bold' : ''}`} 
            onClick={() => setActiveTab('Weekly')}
          >
            Weekly Tasks
          </a>
        </div>

      
        <div className="overflow-x-auto bg-base-100 rounded-2xl shadow-lg">
          <table className="table table-zebra w-full">
            <thead className="text-base">
              <tr>
                <th>Activity</th>
                <th>Progress (Minutes)</th>
                <th>Date Logged</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <tr key={activity._id} className="hover">
                    <td className="font-medium text-lg">{activity.activityName}</td>
                    <td>
                      <span className="font-bold text-lg">{activity.durationMinutes}</span> / {activity.targetMinutes}
                      <ProgressBar completed={activity.durationMinutes} target={activity.targetMinutes} />
                    </td>
                    <td>{formatDate(activity.date)}</td>
                    <td className="flex flex-col sm:flex-row gap-2">
                      <button 
                        className="btn btn-sm btn-outline btn-primary"
                        onClick={() => openProgressModal(activity)}
                      >
                        Log Progress
                      </button>
                      <button
                        className="btn btn-sm btn-ghost text-error"
                        onClick={() => handleDelete(activity._id)}
                      >
                        <RiDeleteBinLine size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-lg text-gray-500">
                    No {activeTab.toLowerCase()} activities logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

     
      <dialog id="progress_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Log Progress for {selectedActivity?.activityName}</h3>
          <form onSubmit={handleProgressSubmit}>
            <div className="form-control py-4">
              <label className="label">
                <span className="label-text">Minutes to Add:</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 30"
                className="input input-bordered w-full"
                value={durationToAdd}
                onChange={(e) => setDurationToAdd(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="modal-action">
              <button type="submit" className="btn btn-primary" disabled={isModalLoading}>
                {isModalLoading ? <span className="loading loading-spinner"></span> : "Update"}
              </button>
              <button type="button" className="btn" onClick={() => document.getElementById('progress_modal').close()}>Cancel</button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default ActivityTracker;

