import mongoose from "mongoose";

const screenTimeSchema = new mongoose.Schema({
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  deviceType: {
    type: String,
    required: [true, 'Please select a device/usage type'],
    enum: ['Internet', 'Mobile', 'Other'], 
  },
  
  durationMinutes: {
    type: Number,
    required: [true, 'Please enter a duration'],
    min: [1, 'Duration must be at least 1 minute'],
  },
  
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'A date is required'],
  },
}, {
  timestamps: true, 
});


const ScreenTime = mongoose.model("ScreenTime", screenTimeSchema);

export default ScreenTime;

