import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import MetricsLog from '../models/metricsLogModel.js';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
 try {
  const { username, name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
      await MetricsLog.create({ event: 'SIGNUP_FAIL' });
   return res.status(400).json({ message: 'User already exists' });
    }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
   username,
   name,
   email,
   password: hashedPassword,
   });

    await MetricsLog.create({ event: 'SIGNUP_SUCCESS' });
   res.status(201).json({ message: 'User created', user });
   } catch (error) {
    await MetricsLog.create({ event: 'SIGNUP_FAIL' });
   res.status(500).json({ error: error.message });
 }
};

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
 try {
   const { email, password } = req.body;
   const user = await User.findOne({ email });
   if (!user) {
      // --- METRIC LOGGING ---
      await MetricsLog.create({ event: 'LOGIN_FAIL' });
      // ----------------------
   return res.status(404).json({ message: 'Invalid credentials' });
    }

   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
      // --- METRIC LOGGING ---
      await MetricsLog.create({ event: 'LOGIN_FAIL' });
      // ----------------------
     return res.status(400).json({ message: 'Invalid credentials' });
    }

   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
     });

    // --- METRIC LOGGING ---
    await MetricsLog.create({ event: 'LOGIN_SUCCESS' });
    // ----------------------

    user.password = undefined;
     res.status(200).json({ user, message: 'Login successful', token });
   } catch (error) {
    await MetricsLog.create({ event: 'LOGIN_FAIL' });
     res.status(500).json({ error: error.message });
   }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      await MetricsLog.create({ event: 'FORGOT_PASSWORD_FAIL' });
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 minutes)',
        message,
      });

      await MetricsLog.create({ event: 'FORGOT_PASSWORD_SUCCESS' });
      res.status(200).json({
        message: 'Reset Link sent to email!',
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      await MetricsLog.create({ event: 'FORGOT_PASSWORD_FAIL' });
      res.status(500).json({
        message: 'There was an error sending the email. Try again later.',
      });
    }
  } catch (error) {
    await MetricsLog.create({ event: 'FORGOT_PASSWORD_FAIL' });
    res.status(500).json({ error: error.message });
  }
};

// @desc    Reset password
// @route   PATCH /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      await MetricsLog.create({ event: 'RESET_PASSWORD_FAIL' });
      return res
        .status(400)
        .json({ message: 'Token is invalid or has expired' });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await MetricsLog.create({ event: 'RESET_PASSWORD_SUCCESS' });
    res.status(200).json({ message: 'Password reset successful!' });
  } catch (error) {
    await MetricsLog.create({ event: 'RESET_PASSWORD_FAIL' });
    res.status(500).json({ error: error.message });
  }
};