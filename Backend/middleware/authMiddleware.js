// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// This is a placeholder for your authentication middleware.
// It is designed to protect routes, ensuring only authenticated users can access them.
// In a real application, it would verify a JWT token from the request header.
export const protect = async (req, res, next) => {
  let token;

  // Check for the token in the headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
