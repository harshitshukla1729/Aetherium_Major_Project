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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <div className="card w-full max-w-lg bg-white shadow-xl border border-gray-200 p-8 rounded-2xl relative transition-all hover:shadow-2xl">
        <Link
          to="/activities"
          className="absolute top-5 left-5 text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
        >
          ← Back to Tracker
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-emerald-700 mb-2">
            Log New Activity
          </h1>
          <p className="text-gray-500 text-sm">
            Record your progress and stay consistent 💪
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Activity Name
            </label>
            <select
              name="activityName"
              className="select select-bordered w-full rounded-lg bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              value={formData.activityName}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select an activity
              </option>
              <option value="Basketball">Basketball</option>
              <option value="Badminton">Badminton</option>
              <option value="Coding">Coding</option>
              <option value="Reading">Reading</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {formData.activityName === "Others" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Custom Activity Name
              </label>
              <input
                type="text"
                name="customActivityName"
                placeholder="e.g., Volunteering"
                className="input input-bordered w-full rounded-lg bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                value={formData.customActivityName}
                onChange={handleChange}
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
              className="select select-bordered w-full rounded-lg bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              value={formData.taskType}
              onChange={handleChange}
              required
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          {/* Target + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Target (in minutes)
              </label>
              <input
                type="number"
                name="targetMinutes"
                placeholder="e.g., 120"
                className="input input-bordered w-full rounded-lg bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                value={formData.targetMinutes}
                onChange={handleChange}
                min="1"
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
                className="input input-bordered w-full rounded-lg bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="btn w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 border-none text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              disabled={loading}
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
