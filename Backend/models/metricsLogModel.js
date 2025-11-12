import mongoose from 'mongoose';

const metricsLogSchema = new mongoose.Schema({
  event: { 
    type: String, 
    required: true,
    // Using an enum helps keep data clean
    enum: [
      'SIGNUP_SUCCESS', 'SIGNUP_FAIL',
      'LOGIN_SUCCESS', 'LOGIN_FAIL',
      'TOKEN_SUCCESS', 'TOKEN_FAIL',
      'FORGOT_PASSWORD_SUCCESS', 'FORGOT_PASSWORD_FAIL',
      'RESET_PASSWORD_SUCCESS', 'RESET_PASSWORD_FAIL'
    ]
  },
  createdAt: { type: Date, default: Date.now, expires: '30d' } // Automatically delete logs after 30 days
});

// Create an index on the 'event' field for faster queries
metricsLogSchema.index({ event: 1 });

export default mongoose.model('MetricsLog', metricsLogSchema);