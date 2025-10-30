import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';


const token = localStorage.getItem('token');

if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const ActivityForm = () => {
  const [formData, setFormData] = useState({
    activityName: '', 
    customActivityName: '', 
    date: new Date().toISOString().split('T')[0], 
    taskType: 'Daily', 
    targetMinutes: 60, 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

  
    const finalActivityName = formData.activityName === 'Others' 
      ? formData.customActivityName 
      : formData.activityName;

    
    if (!finalActivityName || !formData.date || !formData.taskType || !formData.targetMinutes) {
      toast.error('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (formData.targetMinutes <= 0) {
      toast.error('Target must be a positive number.');
      setLoading(false);
      return;
    }

    
    const activityData = {
      activityName: finalActivityName,
      durationMinutes: 0, 
      date: formData.date,
      taskType: formData.taskType,
      targetMinutes: Number(formData.targetMinutes)
    };

    try {
      const response = await axios.post('http://localhost:3000/api/activities', activityData);

      if (response.data) {
        toast.success('Activity logged successfully!');
        
        setFormData({
          activityName: '',
          customActivityName: '',
          date: new Date().toISOString().split('T')[0],
          taskType: 'Daily',
          targetMinutes: 60,
        });
        
        setTimeout(() => {
          navigate('/activities');
        }, 1000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to log activity. Please try again.';
      toast.error(errorMessage);
      console.error('Error submitting activity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 dark:bg-slate-900" data-theme="emerald">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl p-8 rounded-2xl relative">
        
       
        <Link to="/activities" className="absolute top-6 left-6 btn btn-ghost btn-sm text-primary hover:text-primary-focus">
          &larr; Back to Tracker
        </Link>

        <div className="card-body p-0">
          <h1 className="text-3xl font-bold text-center text-primary mb-6">
            Log New Activity
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
           
            <div className="form-control">
              <label className="label">
                <span className="label-text">Activity Name</span>
              </label>
              <select
                name="activityName"
                className="select select-bordered w-full rounded-lg"
                value={formData.activityName}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select an activity</option>
                <option value="Basketball">Basketball</option>
                <option value="Badminton">Badminton</option>
                <option value="Coding">Coding</option>
                <option value="Reading">Reading</option>
                <option value="Others">Others</option>
              </select>
            </div>

            
            {formData.activityName === 'Others' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Custom Activity Name</span>
                </label>
                <input
                  type="text"
                  name="customActivityName"
                  placeholder="e.g., Volunteering"
                  className="input input-bordered w-full rounded-lg"
                  value={formData.customActivityName}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

           
            <div className="form-control">
              <label className="label">
                <span className="label-text">Task Type</span>
              </label>
              <select
                name="taskType"
                className="select select-bordered w-full rounded-lg"
                value={formData.taskType}
                onChange={handleChange}
                required
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Target (in minutes)</span>
                </label>
                <input
                  type="number"
                  name="targetMinutes"
                  placeholder="e.g., 120"
                  className="input input-bordered w-full rounded-lg"
                  value={formData.targetMinutes}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              
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
            
           
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full rounded-lg"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : 'Log Activity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActivityForm;

