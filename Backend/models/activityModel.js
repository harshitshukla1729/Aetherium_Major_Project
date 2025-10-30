import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
 
  activityName: {
    type: String,
    required: [true, 'An activity must have a name'],
    trim: true,
    maxlength: [100, 'Activity name must be less than 100 characters'],
  },
  durationMinutes: {
    type: Number,
    required: [true, 'An activity must have a duration'],
    min: [0, 'Duration must be at least 0 minutes'], 
    default: 0, 
  },
  
  targetMinutes: {
    type: Number,
    required: [true, 'An activity must have a target duration'],
    min: [1, 'Target duration must be at least 1 minute'],
  },
  taskType: {
    type: String,
    enum: ['Daily', 'Weekly'],
    required: [true, 'An activity must have a task type (Daily/Weekly)'],
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'An activity must have a date'],
  },
}, {
  timestamps: true,
});

const Activity = mongoose.models.Activity || mongoose.model("Activity", activitySchema);

export default Activity;

