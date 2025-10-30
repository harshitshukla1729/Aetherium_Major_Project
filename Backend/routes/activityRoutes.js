import express from "express";
import { protect } from '../middleware/authMiddleware.js'; 
import { 
  createActivity, 
  getMyActivities, 
  deleteActivity,
  getActivitySummary,
  updateActivityProgress,
  getFeedback 
} from '../controllers/activityController.js';

const router = express.Router();


router.route('/')
  .post(protect, createActivity)
  .get(protect, getMyActivities);


router.get('/feedback', protect, getFeedback);


router.get('/summary', protect, getActivitySummary);


router.route('/:id')
  .delete(protect, deleteActivity)
  .patch(protect, updateActivityProgress); 

export default router;

