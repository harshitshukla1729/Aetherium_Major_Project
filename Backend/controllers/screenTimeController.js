import ScreenTime from '../models/screenTimeModel.js';
import mongoose from 'mongoose';

/**
 * @desc    Log new screen time
 * @route   POST /api/screentime
 * @access  Private
 */
export const logScreenTime = async (req, res) => {
  try {
    const { deviceType, durationMinutes, date } = req.body;

    // Basic validation
    if (!deviceType || !durationMinutes || !date) {
      return res.status(400).json({ message: 'Please provide device type, duration, and date.' });
    }

    const newScreenTime = new ScreenTime({
      userId: req.user.id, 
      deviceType,
      durationMinutes: Number(durationMinutes),
      date,
    });

    const savedLog = await newScreenTime.save();
    res.status(201).json({ status: 'success', data: savedLog });

  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    console.error('Error in logScreenTime:', error);
    res.status(500).json({ message: 'Server error. Could not log time.' });
  }
};

/**
 * @desc    Get all screen time logs for the user
 * @route   GET /api/screentime
 * @access  Private
 */
export const getMyScreenTime = async (req, res) => {
  try {
    const logs = await ScreenTime.find({ userId: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('Error in getMyScreenTime:', error);
    res.status(500).json({ message: 'Server error. Could not fetch logs.' });
  }
};

/**
 * @desc    Delete a screen time log
 * @route   DELETE /api/screentime/:id
 * @access  Private
 */
export const deleteScreenTimeLog = async (req, res) => {
  try {
    const { id } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid log ID.' });
    }

    const log = await ScreenTime.findById(id);

    if (!log) {
      return res.status(404).json({ message: 'Log not found.' });
    }

    
    if (log.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this log.' });
    }

    await log.deleteOne(); 

    res.status(200).json({ status: 'success', message: 'Log deleted.' });

  } catch (error) {
    console.error('Error in deleteScreenTimeLog:', error);
    res.status(500).json({ message: 'Server error. Could not delete log.' });
  }
};

