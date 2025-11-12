import MetricsLog from '../models/metricsLogModel.js';

// @desc    Calculate and return the Authentication Success Rate
// @route   GET /api/metrics/auth-rate
// @access  Private (Admin or protected)
export const getAuthSuccessRate = async (req, res) => {
  try {
    // 1. Define all possible success and fail events
    const successEvents = [
      'SIGNUP_SUCCESS', 
      'LOGIN_SUCCESS', 
      'TOKEN_SUCCESS',
      'FORGOT_PASSWORD_SUCCESS',
      'RESET_PASSWORD_SUCCESS'
    ];

    const failEvents = [
      'SIGNUP_FAIL', 
      'LOGIN_FAIL', 
      'TOKEN_FAIL',
      'FORGOT_PASSWORD_FAIL',
      'RESET_PASSWORD_FAIL'
    ];

    // 2. Count the documents for each category
    const successes = await MetricsLog.countDocuments({ event: { $in: successEvents } });
    const failures = await MetricsLog.countDocuments({ event: { $in: failEvents } });

    // 3. Calculate the rate
    const total = successes + failures;

    if (total === 0) {
      return res.json({ 
        rate: 100.00, 
        total: 0, 
        successes: 0, 
        failures: 0 
      });
    }

    const successRate = (successes / total) * 100;

    // 4. Return the detailed report
    res.json({ 
      rate: successRate.toFixed(2), // e.g., "99.50"
      total: total,
      successes: successes,
      failures: failures
    });

  } catch (error) {
    console.error("Error calculating auth success rate:", error);
    res.status(500).json({ error: error.message });
  }
};