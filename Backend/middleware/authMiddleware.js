import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import MetricsLog from '../models/metricsLogModel.js';
/**
 * @desc    Strict middleware to protect routes.
 * Blocks any request without a valid token.
 * Used for: /api/activities, /api/screentime, etc.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get user from the token (excluding the password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        // This handles a case where a user was deleted but their token is still valid
        return res.status(401).json({ message: 'User not found.' });
      }
      await MetricsLog.create({ event: 'TOKEN_SUCCESS' });
      next();
    } catch (error) {
      console.error(error);
      // This will catch expired tokens or invalid tokens
      await MetricsLog.create({ event: 'TOKEN_FAIL' });
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
     await MetricsLog.create({ event: 'TOKEN_FAIL' });
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

/**
 * @desc    Optional middleware to check for a user.
 * Attaches req.user if a valid token is present.
 * Does NOT block the request if no token is present (allows guests).
 * Used for: /api/survey/submit
 */
export const attachUserIfPresent = async (req, res, next) => {
  let token;

  // 1. Check if token exists
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      // We found a valid user, attach them and continue
      next();

    } catch (error) {
      // The token is present but invalid (expired, wrong, etc.)
      // We don't block the request, we just move on. The user is a guest.
      console.log('Invalid token provided, proceeding as guest.');
      next();
    }
  } else {
    // No token was provided. This is fine, proceed as a guest.
    next();
  }
};