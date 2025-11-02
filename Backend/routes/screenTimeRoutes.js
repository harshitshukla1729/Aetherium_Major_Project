import express from "express";
import { protect } from '../middleware/authMiddleware.js'; 
import { logScreenTime, getMyScreenTime, deleteScreenTimeLog } from '../controllers/screenTimeController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .post(logScreenTime)   // POST /api/screentime
  .get(getMyScreenTime);  // GET /api/screentime

// Add new route for deleting
router.route('/:id')
  .delete(deleteScreenTimeLog); // DELETE /api/screentime/:id

export default router;

