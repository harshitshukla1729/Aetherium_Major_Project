import Activity from '../models/activityModel.js';
import mongoose from 'mongoose';


const getTodayRange = () => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));
  return { start: todayStart, end: todayEnd };
};

const getYesterdayRange = () => {
  const now = new Date();
  const yesterday = new Date(now.setDate(now.getDate() - 1));
  const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0));
  const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999));
  return { start: yesterdayStart, end: yesterdayEnd };
};

const getLastWeekRange = () => {
  const now = new Date();
  const lastSunday = new Date(now.setDate(now.getDate() - now.getDay() - 7));
  const weekStart = new Date(lastSunday.setHours(0, 0, 0, 0));
  const lastSaturday = new Date(lastSunday.setDate(lastSunday.getDate() + 6));
  const weekEnd = new Date(lastSaturday.setHours(23, 59, 59, 999));
  return { start: weekStart, end: weekEnd };
};


const getMotivationalMessage = (percentage) => {
  if (percentage >= 100) {
    return "Amazing work! You've completed 100% of your goals. We're proud of you!";
  } else if (percentage >= 50) {
    return `You're over halfway there with ${percentage}% complete! Keep up the great momentum, you can do this!`;
  } else if (percentage > 0) {
    return `You've made a solid start at ${percentage}%. Every step counts. Keep focusing on your goals, you have the strength to see them through!`;
  } else {
    return "It looks like you had a tough period. Remember why you set these goals. A small step today can make a big difference tomorrow. You can do this!";
  }
};


const processFeedback = async (userId, taskType, dateRange) => {
  const activities = await Activity.find({
    userId,
    taskType,
    date: { $gte: dateRange.start, $lte: dateRange.end },
  });

  let totalCompleted = 0;
  let totalTarget = 0;
  const congratulations = [];
  const missedTasks = [];

  activities.forEach(activity => {
    totalCompleted += activity.durationMinutes;
    totalTarget += activity.targetMinutes;

    if (activity.durationMinutes >= activity.targetMinutes) {
      congratulations.push(activity.activityName);
    } else {
      missedTasks.push(activity.activityName);
    }
  });

  const completionPercentage = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;
  const motivationalMessage = getMotivationalMessage(completionPercentage);

  return {
    completionPercentage,
    congratulations,
    missedTasks,
    motivationalMessage,
  };
};

/**
 * @desc    Get Feedback for Daily and Weekly tasks
 * @route   GET /api/activities/feedback
 * @access  Private
 */
export const getFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const yesterdayRange = getYesterdayRange();
    const dailyFeedback = await processFeedback(userId, 'Daily', yesterdayRange);
    const lastWeekRange = getLastWeekRange();
    const weeklyFeedback = await processFeedback(userId, 'Weekly', lastWeekRange);

    res.status(200).json({
      status: 'success',
      data: {
        daily: dailyFeedback,
        weekly: weeklyFeedback,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


/**
 * @desc    Create a new activity
 * @route   POST /api/activities
 * @access  Private
 */
export const createActivity = async (req, res) => {
  try {
    const { activityName, targetMinutes, taskType, date } = req.body;

    if (!activityName || !targetMinutes || !taskType || !date) {
      return res.status(400).json({ message: 'Please provide activity name, target, type, and date.' });
    }

    const activity = new Activity({
      userId: req.user.id, 
      activityName,
      durationMinutes: 0, 
      targetMinutes,
      taskType,
      date,
    });

    const createdActivity = await activity.save();
    res.status(201).json({ status: 'success', data: createdActivity });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
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
    res.status(200).json({ status: 'success', count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get daily and weekly summary for the logged-in user
 * @route   GET /api/activities/summary
 * @access  Private
 */
export const getActivitySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start: todayStart, end: todayEnd } = getTodayRange();

    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const diff = now.getDate() - dayOfWeek;
    const weekStart = new Date(new Date(now.setDate(diff)).setHours(0, 0, 0, 0));

    const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));
    weekEnd.setHours(23, 59, 59, 999);

    
    const dailySummary = await Activity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          taskType: 'Daily',
          date: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalCompleted: { $sum: '$durationMinutes' },
          totalTarget: { $sum: '$targetMinutes' },
        },
      },
    ]);


    const weeklySummary = await Activity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          taskType: 'Weekly',
          date: { $gte: weekStart, $lte: weekEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalCompleted: { $sum: '$durationMinutes' },
          totalTarget: { $sum: '$targetMinutes' },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        daily: dailySummary[0] || { totalCompleted: 0, totalTarget: 0 },
        weekly: weeklySummary[0] || { totalCompleted: 0, totalTarget: 0 },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Update activity progress
 * @route   PATCH /api/activities/:id
 * @access  Private
 */
export const updateActivityProgress = async (req, res) => {
  try {
    const { durationToAdd } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    if (!durationToAdd || durationToAdd <= 0) {
      return res.status(400).json({ message: 'Please provide a valid duration to add.' });
    }

    
    const triggeringActivity = await Activity.findOne({ _id: id, userId });
    if (!triggeringActivity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    const activityName = triggeringActivity.activityName;

   
    const now = new Date();
   
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));
    
    
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    const weekStart = new Date(new Date(now.setDate(diff)).setHours(0, 0, 0, 0));
    const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));
    weekEnd.setHours(23, 59, 59, 999);


    
    const query = {
      userId,
      activityName,
      $or: [
        { taskType: 'Daily', date: { $gte: todayStart, $lte: todayEnd } },
        { taskType: 'Weekly', date: { $gte: weekStart, $lte: weekEnd } },
      ],
    };

    
    await Activity.updateMany(query, {
      $inc: { durationMinutes: Number(durationToAdd) },
    });

   
    const updatedActivity = await Activity.findById(id);

    res.status(200).json({ status: 'success', data: updatedActivity });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Delete an activity
 * @route   DELETE /api/activities/:id
 * @access  Private
 */
export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.id, 
    });

    if (!activity) {
      return res.status(4404).json({ message: 'Activity not found' });
    }

    await activity.deleteOne();
    res.status(200).json({ status: 'success', data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

