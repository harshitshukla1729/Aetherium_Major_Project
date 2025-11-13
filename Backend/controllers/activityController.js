import Activity from '../models/activityModel.js';
import ScreenTime from '../models/screenTimeModel.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new activity (works for both AI Planner & Manual Tracker)
 * @route   POST /api/activities
 * @access  Private
 */
export const createActivity = async (req, res) => {
  try {
    const {
      activityName,
      durationMinutes, // Provided by Manual Form
      date,
      taskType,
      targetMinutes,   // Provided by AI Planner
    } = req.body;

    // --- 1. Universal Validation ---
    if (!activityName) {
      return res.status(400).json({
        message: 'Validation failed. Please provide at least an activityName.',
      });
    }

    // --- 2. Create the base activity object ---
    const newActivity = {
      userId: req.user.id,
      activityName: activityName,
      date: date ? new Date(date) : new Date(),
      taskType: taskType || 'Daily', // Default to 'Daily' if not provided
    };

    // --- 3. Handle Different Flows (Planner vs. Manual) ---

    if (targetMinutes !== undefined) {
      // --- AI PLANNER FLOW ---
      // The planner sends a target. Progress (duration) starts at 0.
      newActivity.targetMinutes = parseInt(targetMinutes, 10) || 60;
      newActivity.durationMinutes = 0;
      newActivity.taskType = taskType || 'Weekly'; // Planner tasks are usually Weekly
      
      // --- Parse duration from name (e.g., "Hiking (2 hours)") ---
      // This will make the target more accurate than what the planner sends
      const durationMatch = activityName.match(/\((\d+)\s*(hour|min)s?\)/);
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        newActivity.targetMinutes = (durationMatch[2] === 'hour') ? value * 60 : value;
      }

    } else {
      // --- MANUAL TRACKER FLOW ---
      // The manual form sends progress (duration). The target is the same as the progress.
      newActivity.durationMinutes = parseInt(durationMinutes, 10) || 0;
      newActivity.targetMinutes = newActivity.durationMinutes > 0 ? newActivity.durationMinutes : 30; // Default target
    }

    // --- 4. Save to Database ---
    const activity = new Activity(newActivity);
    const createdActivity = await activity.save();
    
    res.status(201).json({ data: createdActivity });

  } catch (error) {
    console.error('Error creating activity:', error.message);
    res.status(500).json({ message: 'Server error while creating activity.' });
  }
};

/**
 * @desc    Get all activities for the logged-in user
 * @route   GET /api/activities
 * @access  Private
 */
export const getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({
      status: 'success',
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error('Error fetching activities:', error.message);
    res.status(500).json({ message: 'Server error while fetching activities.' });
  }
};

/**
 * @desc    Delete an activity
 * @route   DELETE /api/activities/:id
 * @access  Private
 */
export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    // Verify user ownership
    if (activity.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized.' });
     }

    await activity.deleteOne();
    res.json({ message: 'Activity removed successfully.' });
  } catch (error) {
    console.error('Error deleting activity:', error.message);
    res.status(500).json({ message: 'Server error while deleting activity.' });
  }
};

/**
 * @desc    Update activity progress (with Daily-Weekly sync)
 * @route   PATCH /api/activities/:id
 * @access  Private
 */
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

    const { activityName, taskType, date } = activityToUpdate;

    // --- Determine the date range for the update ---
    let startDate, endDate;

    if (taskType === 'Daily') {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(date);
      const dayOfWeek = startDate.getDay();
      const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
       startDate = new Date(startDate.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    // --- 1️⃣ Update all matching activities for this period ---
    await Activity.updateMany(
      {
        userId: req.user.id,
        activityName,
        taskType,
        date: { $gte: startDate, $lte: endDate },
      },
      { $inc: { durationMinutes: minutesToAdd } }
    );

    // --- Sync counterpart (Daily <-> Weekly) ---
    const counterpartType = taskType === 'Daily' ? 'Weekly' : 'Daily';
    await Activity.updateMany(
      {
        userId: req.user.id,
        activityName,
        taskType: counterpartType,
      },
      { $inc: { durationMinutes: minutesToAdd } }
    );

    res.json({
      message: `Progress updated for ${taskType} and synced with ${counterpartType}.`,
    });
  } catch (error) {
    console.error('Error updating progress with sync:', error.message);
    res.status(500).json({ message: 'Server error while syncing progress.' });
  }
};



/**
 * @desc    Get activity summary (Daily & Weekly)
 * @route   GET /api/activities/summary
 * @access  Private
 */
export const getActivitySummary = async (req, res) => {
  try {
    const now = new Date();

    // Daily period
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    // Weekly period (Mon–Sun)
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(new Date(now.setDate(diff)).setHours(0, 0, 0, 0));
    const endOfWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6));
    endOfWeek.setHours(23, 59, 59, 999);

    const getSummary = async (startDate, endDate, type) => {
      const activities = await Activity.find({
        userId: req.user.id,
        taskType: type,
        date: { $gte: startDate, $lte: endDate },
       });

      let totalTarget = 0;
      let totalCompleted = 0;

      activities.forEach((act) => {
        totalTarget += act.targetMinutes;
        totalCompleted += act.durationMinutes;
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
    console.error('Error fetching activity summary:', error.message);
     res.status(500).json({ message: 'Server error while fetching summary.' });
  }
};

/**
 * @desc    Get feedback report (Daily & Weekly)
 * @route   GET /api/activities/feedback
 * @access  Private
 */
export const getFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // --- Date ranges ---
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

    const startOfYesterday = new Date(new Date().setDate(now.getDate() - 1));
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(new Date().setDate(now.getDate() - 1));
    endOfYesterday.setHours(23, 59, 59, 999);

    const dayOfWeek = now.getDay();
    const diffToMon = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
     const startOfWeek = new Date(new Date(now.setDate(diffToMon)).setHours(0, 0, 0, 0));
    const endOfWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6));
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfLastWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() - 7));
    const endOfLastWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() - 1));
    endOfLastWeek.setHours(23, 59, 59, 999);

    // --- Helper function ---
    const generateReport = async (startDate, endDate, period, missedStart, missedEnd) => {
      const activities = await Activity.find({
        userId,
        taskType: period,
        date: { $gte: startDate, $lte: endDate },
      });

      let totalTarget = 0;
      let totalCompleted = 0;
      const completedTasks = [];

      activities.forEach((act) => {
        totalTarget += act.targetMinutes;
        totalCompleted += act.durationMinutes;
        if (act.durationMinutes >= act.targetMinutes) {
          completedTasks.push(act);
        }
      });

      const overallProgress = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;

      const missedTasks = await Activity.find({
        userId,
        taskType: period,
        date: { $gte: missedStart, $lte: missedEnd },
        $expr: { $lt: ['$durationMinutes', '$targetMinutes'] },
      });

      let message = '';
      if (totalTarget === 0) {
        message = "You didn't set any goals for this period. Try adding some activities!";
      } else if (overallProgress >= 100) {
        message = 'Fantastic! You met or exceeded your goals.';
      } else if (overallProgress >= 50) {
        message = "Great effort! You're more than halfway there.";
      } else {
        message = 'Keep going! Small steps add up over time.';
     }

      const screenTimeLogs = await ScreenTime.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      });

      let totalScreenTime = 0;
      const byType = {};
      screenTimeLogs.forEach((log) => {
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
        screenTime: { totalScreenTime, byType },
       };
    };

    const dailyReport = await generateReport(startOfDay, endOfDay, 'Daily', startOfYesterday, endOfYesterday);
    const weeklyReport = await generateReport(startOfWeek, endOfWeek, 'Weekly', startOfLastWeek, endOfLastWeek);

    res.json({
      status: 'success',
      data: { daily: dailyReport, weekly: weeklyReport },
    });
  } catch (error) {
    console.error('Error fetching feedback:', error.message);
    res.status(500).json({ message: 'Server error while fetching feedback.' });
 }
};