import Activity from '../models/activityModel.js';
import ScreenTime from '../models/screenTimeModel.js';
import mongoose from 'mongoose';

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private
export const createActivity = async (req, res) => {
  try {
    const { activityName, durationMinutes, date, taskType, targetMinutes } = req.body;

    // Validation
    if (!activityName || !durationMinutes === undefined || !date || !taskType || !targetMinutes) {
      return res.status(400).json({ message: 'Please provide activity name, duration, date, task type, and target minutes.' });
    }

    const activity = new Activity({
      userId: req.user.id,
      activityName,
      durationMinutes,
      date: new Date(date),
      taskType,
      targetMinutes,
    });

    const createdActivity = await activity.save();
    res.status(201).json({ data: createdActivity });
  } catch (error) {
    console.error("Error creating activity:", error.message);
    res.status(500).json({ message: 'Server error while creating activity.' });
  }
};

// @desc    Get logged in user's activities
// @route   GET /api/activities
// @access  Private
export const getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({
      status: 'success',
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error.message);
    res.status(500).json({ message: 'Server error while fetching activities.' });
  }
};

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Private
export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    // Check if the user owns this activity
    if (activity.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized.' });
    }

    await activity.deleteOne();
    res.json({ message: 'Activity removed.' });
  } catch (error) {
    console.error("Error deleting activity:", error.message);
    res.status(500).json({ message: 'Server error while deleting activity.' });
  }
};

// @desc    Update activity progress
// @route   PATCH /api/activities/:id
// @access  Private
export const updateActivityProgress = async (req, res) => {
  try {
    const { minutesToAdd } = req.body;
    if (!minutesToAdd || minutesToAdd <= 0) {
      return res.status(400).json({ message: 'Please provide a positive number of minutes to add.' });
    }

    const activityToUpdate = await Activity.findById(req.params.id);

    if (!activityToUpdate) {
      return res.status(404).json({ message: 'Activity not found.' });
    }
    if (activityToUpdate.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized.' });
    }

    // Find all matching activities (same name, same type, same period)
    const { activityName, taskType, date } = activityToUpdate;
    
    let startDate, endDate;

    if (taskType === 'Daily') {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else { // Weekly
      startDate = new Date(date);
      const dayOfWeek = startDate.getDay();
      const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
      startDate = new Date(startDate.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    await Activity.updateMany(
      { 
        userId: req.user.id,
        activityName,
        taskType,
        date: { $gte: startDate, $lte: endDate }
      },
      { $inc: { durationMinutes: minutesToAdd } }
    );
    
    res.json({ message: 'Activity progress updated for all matching tasks.' });

  } catch (error) {
    console.error("Error updating progress:", error.message);
    res.status(500).json({ message: 'Server error while updating progress.' });
  }
};

// @desc    Get user's activity summary
// @route   GET /api/activities/summary
// @access  Private
export const getActivitySummary = async (req, res) => {
  try {
    const now = new Date();
    
    // Daily Dates
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Weekly Dates (Monday to Sunday)
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
    const startOfWeek = new Date(new Date(now.setDate(diff)).setHours(0, 0, 0, 0));
    const endOfWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6));
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Helper function to aggregate data
    const getSummary = async (startDate, endDate, type) => {
      const activities = await Activity.find({
        userId: req.user.id,
        taskType: type,
        date: { $gte: startDate, $lte: endDate },
      });

      let totalTarget = 0;
      let totalCompleted = 0;
      
      activities.forEach(activity => {
        totalTarget += activity.targetMinutes;
        totalCompleted += activity.durationMinutes;
      });
      
      return { totalTarget, totalCompleted };
    };

    const dailySummary = await getSummary(startOfDay, endOfDay, 'Daily');
    const weeklySummary = await getSummary(startOfWeek, endOfWeek, 'Weekly');

    res.json({
      status: 'success',
      data: {
        daily: dailySummary,
        weekly: weeklySummary,
      },
    });

  } catch (error) {
    console.error("Error fetching summary:", error.message);
    res.status(500).json({ message: 'Server error while fetching summary.' });
  }
};


// @desc    Get user's feedback report
// @route   GET /api/activities/feedback
// @access  Private
export const getFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // --- Date Ranges ---
    // Today
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
    
    // Yesterday
    const startOfYesterday = new Date(new Date().setDate(now.getDate() - 1));
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(new Date().setDate(now.getDate() - 1));
    endOfYesterday.setHours(23, 59, 59, 999);

    // This Week (Mon-Sun)
    const dayOfWeek = now.getDay();
    const diffToMon = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(new Date(now.setDate(diffToMon)).setHours(0, 0, 0, 0));
    const endOfWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6));
    endOfWeek.setHours(23, 59, 59, 999);

    // Last Week (Mon-Sun)
    const startOfLastWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() - 7));
    const endOfLastWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() - 1));
    endOfLastWeek.setHours(23, 59, 59, 999);

    // --- Helper Function ---
    const generateReport = async (startDate, endDate, period, missedTaskStartDate, missedTaskEndDate) => {
      // 1. Get Progress for the period
      const activities = await Activity.find({
        userId,
        taskType: period,
        date: { $gte: startDate, $lte: endDate },
      });

      let totalTarget = 0;
      let totalCompleted = 0;
      const completedTasks = [];

      activities.forEach(act => {
        totalTarget += act.targetMinutes;
        totalCompleted += act.durationMinutes;
        if (act.durationMinutes >= act.targetMinutes) {
          completedTasks.push(act);
        }
      });

      const overallProgress = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;

      // 2. Get Missed Tasks from *last* period
      const missedTasks = await Activity.find({
        userId,
        taskType: period,
        date: { $gte: missedTaskStartDate, $lte: missedTaskEndDate },
        $expr: { $lt: ["$durationMinutes", "$targetMinutes"] } // Find where duration < target
      });

      // 3. Generate Message
      let message = "";
      if (totalTarget === 0) {
        message = "You didn't set any goals for this period. Try adding some activities!";
      } else if (overallProgress >= 100) {
        message = "Fantastic! You've met or exceeded all your goals. Keep up the amazing work!";
      } else if (overallProgress >= 50) {
        message = "Great effort! You're more than halfway there. You can definitely do it!";
      } else {
        message = "It looks like you had a tough period. Remember why you set these goals. A small step today can make a big difference tomorrow.";
      }

      // 4. Get Screen Time for the period
      const screenTimeLogs = await ScreenTime.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      });

      let totalScreenTime = 0;
      const byType = {};

      screenTimeLogs.forEach(log => {
        totalScreenTime += log.durationMinutes;
        byType[log.deviceType] = (byType[log.deviceType] || 0) + log.durationMinutes;
      });
      
      return {
        progress: {
          overallProgress: parseFloat(overallProgress.toFixed(0)),
          totalTarget,
          totalCompleted,
          message,
          completedTasks,
          missedTasks,
        },
        screenTime: {
          totalScreenTime,
          byType
        }
      };
    };

    // --- Generate Reports ---
    const dailyReport = await generateReport(startOfDay, endOfDay, 'Daily', startOfYesterday, endOfYesterday);
    const weeklyReport = await generateReport(startOfWeek, endOfWeek, 'Weekly', startOfLastWeek, endOfLastWeek);

    res.json({
      status: 'success',
      data: {
        daily: dailyReport,
        weekly: weeklyReport,
      },
    });

  } catch (error) {
    console.error("Error fetching feedback:", error.message);
    res.status(500).json({ message: 'Server error while fetching feedback.' });
  }
};

