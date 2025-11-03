import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

const ActivityForm = () => {
  const [formData, setFormData] = useState({
    activityName: "",
    customActivityName: "",
    date: new Date().toISOString().split("T")[0],
    taskType: "Daily",
    targetMinutes: 60,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalActivityName =
      formData.activityName === "Others"
        ? formData.customActivityName
        : formData.activityName;

    if (
      !finalActivityName ||
      !formData.date ||
      !formData.taskType ||
      !formData.targetMinutes
    ) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (formData.targetMinutes <= 0) {
      toast.error("Target must be a positive number.");
      setLoading(false);
      return;
    }

    const activityData = {
      activityName: finalActivityName,
      durationMinutes: 0,
      date: formData.date,
      taskType: formData.taskType,
      targetMinutes: Number(formData.targetMinutes),
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/api/activities",
        activityData
      );

      if (response.data) {
        toast.success("Activity logged successfully!");
        setFormData({
          activityName: "",
          customActivityName: "",
          date: new Date().toISOString().split("T")[0],
          taskType: "Daily",
          targetMinutes: 60,
        });
        setTimeout(() => navigate("/activities"), 1000);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to log activity. Please try again.";
      toast.error(errorMessage);
      console.error("Error submitting activity:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-300 border border-gray-200 p-8">
        {/* Back link */}
        <Link
          to="/activities"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mb-6"
        >
          ← Back to Tracker
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-1">
            Log New Activity
          </h1>
          <p className="text-gray-500 text-sm">
            Stay consistent — track your daily or weekly goals 🌿
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Activity Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Activity Name
            </label>
            <select
              name="activityName"
              value={formData.activityName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3 py-2 outline-none transition-all"
              required
            >
              <option value="">Select an activity</option>
              <option value="Basketball">Basketball</option>
              <option value="Badminton">Badminton</option>
              <option value="Coding">Coding</option>
              <option value="Reading">Reading</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Custom Activity Name */}
          {formData.activityName === "Others" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Custom Activity Name
              </label>
              <input
                type="text"
                name="customActivityName"
                placeholder="e.g., Volunteering"
                value={formData.customActivityName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3 py-2 outline-none transition-all"
                required
              />
            </div>
          )}

          {/* Task Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Task Type
            </label>
            <select
              name="taskType"
              value={formData.taskType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3 py-2 outline-none transition-all"
              required
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          {/* Target + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Target (in minutes)
              </label>
              <input
                type="number"
                name="targetMinutes"
                placeholder="e.g., 120"
                value={formData.targetMinutes}
                onChange={handleChange}
                min="1"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3 py-2 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3 py-2 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Log Activity"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;
