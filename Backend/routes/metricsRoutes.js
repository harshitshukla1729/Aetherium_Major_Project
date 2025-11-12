import express from 'express';
import { getAuthSuccessRate } from '../controllers/metricsController.js';
import { protect } from '../middleware/authMiddleware.js'; // We protect this route

const router = express.Router();

// This route will return the JSON object with the success rate
// We protect it so only logged-in users (or admins) can see it.
router.get('/auth-rate', protect, getAuthSuccessRate);

export default router;