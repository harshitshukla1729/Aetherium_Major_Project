import express from "express";
import { protect } from '../middleware/authMiddleware.js'; 
import { 
  createActivity, 
  getMyActivities, 
  deleteActivity, 
  updateActivityProgress,
  getFeedback,
  getActivitySummary // Make sure to import this
} from '../controllers/activityController.js';

const router = express.Router();


router.use(protect);


router.get('/summary', getActivitySummary); 


router.get('/feedback', getFeedback);


router.route('/')
  .post(createActivity)   
  .get(getMyActivities);  


router.route('/:id')
  .delete(deleteActivity)         
  .patch(updateActivityProgress); 

export default router;

