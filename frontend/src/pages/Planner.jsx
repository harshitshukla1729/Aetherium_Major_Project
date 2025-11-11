import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; // your configured Axios instance

const allActivities = [
  'Hiking', 'Gardening', 'Cycling', 'Birdwatching',
  'Kayaking', 'Running', 'Walking', 'Picnicking', 'Stargazing'
];

export default function Planner() {
  const [preferences, setPreferences] = useState([]);
  const [customActivity, setCustomActivity] = useState('');
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedTaskIds, setAddedTaskIds] = useState(new Set());
  const [addTaskError, setAddTaskError] = useState(null);

  /**
   * Handle selecting/unselecting activities
   */
  const handleSelectPreference = (activity) => {
    setPreferences((prev) =>
      prev.includes(activity)
        ? prev.filter((item) => item !== activity)
        : [...prev, activity]
    );
  };

  /**
   * Handle adding a custom activity to preferences
   */
  const handleAddCustomPreference = () => {
    if (customActivity.trim() && !preferences.includes(customActivity.trim())) {
      setPreferences((prev) => [...prev, customActivity.trim()]);
      setCustomActivity('');
    }
  };

  /**
   * Generate plan using AI backend
   */
  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedSchedule(null);
    setAddTaskError(null);
    setAddedTaskIds(new Set());

    try {
      const response = await api.post('/api/planner/generate', {
        activities: preferences,
      });
      setGeneratedSchedule(response.data.schedule);
    } catch (err) {
      console.error('Error generating plan:', err);
      setError(
        err.response?.data?.message ||
          'Failed to generate your plan. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add AI or custom task to the Activity Tracker
   */
  const handleAddTaskToTracker = async (taskItem) => {
    const taskName = `${taskItem.activity} (${taskItem.duration} mins)`;

    try {
      await api.post('/api/activities', {
        activityName: taskName,
        durationMinutes: 0,
        date: new Date().toISOString(),
        taskType: taskItem.goalType || 'Weekly',
        targetMinutes: parseInt(taskItem.duration) || 60,
      });

      setAddedTaskIds((prev) => new Set(prev).add(taskItem.activity));
      setAddTaskError(null);
    } catch (err) {
      console.error('Failed to add task to tracker', err);
      setAddTaskError(
        err.response?.data?.message ||
          'Could not add that task. Please try again.'
      );
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">
        Your Personal AI Planner
      </h2>

      {/* Step 1 — Select Preferences */}
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <label className="block text-lg font-semibold mb-3 text-gray-700">
          1️⃣ What activities are you interested in?
        </label>

        <div className="flex flex-wrap gap-3 mb-4">
          {allActivities.map((activity) => (
            <label
              key={activity}
              className={`p-2 px-3 border rounded-full cursor-pointer transition-all ${
                preferences.includes(activity)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                onChange={() => handleSelectPreference(activity)}
                checked={preferences.includes(activity)}
              />
              {activity}
            </label>
          ))}
        </div>

        {/* 🪄 Add Custom Activity in the same section */}
        <div className="flex gap-3 mt-3">
          <input
            type="text"
            placeholder="Add your own activity (e.g., Painting, Jogging...)"
            value={customActivity}
            onChange={(e) => setCustomActivity(e.target.value)}
            className="input input-bordered w-full"
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition btn bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleAddCustomPreference}
          >
            Add
          </button>
        </div>

        {preferences.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Selected Activities:{" "}
            <span className="font-medium text-gray-800">
              {preferences.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Step 2 — Generate Plan */}
      <div className="mt-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <label className="block text-lg font-semibold mb-3 text-gray-700">
          2️⃣ Ready to build your personalized plan?
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Aetherium AI will create daily and weekly tasks tailored to your
          habits and screen-time goals.
        </p>
        <button
          onClick={handleGeneratePlan}
          disabled={isLoading || preferences.length === 0}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition btn-primary w-full bg-blue-600 hover:bg-blue-700 border-none text-white text-lg disabled:bg-gray-400"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            'Generate My Plan'
          )}
        </button>
      </div>

      {/* Step 3 — Results */}
      {error && (
        <p className="text-red-500 mt-4 font-semibold text-center">{error}</p>
      )}

      {generatedSchedule && (
        <div className="mt-8 space-y-6">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            Your Personalized Plan ✨
          </h3>

          {/* 🌟 Heavily Recommended */}
          <div>
            <h4 className="text-xl font-semibold text-blue-700 mb-3">
              🌟 Heavily Recommended
            </h4>
            {generatedSchedule
              .filter((item) => item.priority === 'high')
              .map((item, index) => {
                const isAdded = addedTaskIds.has(item.activity);
                return (
                  <div
                    key={`high-${index}`}
                    className={`p-5 border-2 rounded-lg shadow-md bg-gradient-to-r from-blue-50 to-blue-100 border-blue-400 hover:shadow-lg transition ${
                      isAdded ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                          {item.day}: {item.activity}
                        </h4>
                        <p className="text-md text-gray-600">
                          Duration: {item.duration} mins ({item.goalType})
                        </p>
                        <p className="mt-2 text-sm text-gray-500 italic">
                          <span className="font-semibold">Reason:</span>{' '}
                          {item.reason}
                        </p>
                      </div>
                      <label className="flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-success"
                          checked={isAdded}
                          disabled={isAdded}
                          onChange={() => handleAddTaskToTracker(item)}
                        />
                        <span
                          className={`ml-2 text-sm font-medium ${
                            isAdded ? 'text-green-600' : 'text-gray-700'
                          }`}
                        >
                          {isAdded ? 'Added!' : 'Add'}
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* ✨ Other Recommendations */}
          <div>
            <h4 className="text-xl font-semibold text-gray-700 mb-3">
              ✨ Other Recommendations
            </h4>
            {generatedSchedule
              .filter((item) => item.priority !== 'high')
              .map((item, index) => {
                const isAdded = addedTaskIds.has(item.activity);
                return (
                  <div
                    key={`normal-${index}`}
                    className={`p-5 border rounded-lg shadow-sm bg-white hover:bg-gray-50 transition ${
                      isAdded ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {item.day}: {item.activity}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Duration: {item.duration} mins ({item.goalType})
                        </p>
                        <p className="mt-2 text-sm text-gray-500 italic">
                          {item.reason}
                        </p>
                      </div>
                      <label className="flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-success"
                          checked={isAdded}
                          disabled={isAdded}
                          onChange={() => handleAddTaskToTracker(item)}
                        />
                        <span
                          className={`ml-2 text-sm font-medium ${
                            isAdded ? 'text-green-600' : 'text-gray-700'
                          }`}
                        >
                          {isAdded ? 'Added!' : 'Add'}
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
