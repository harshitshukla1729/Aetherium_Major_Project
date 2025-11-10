// server/routes/plannerRoutes.js
import express from 'express';
import { generatePlan } from '../controllers/PlannerController.js';
import { protect } from '../middleware/authMiddleware.js';
import {attachUserIfPresent} from '../middleware/authMiddleware.js'
const router = express.Router();
router.post('/generate',attachUserIfPresent, generatePlan);

export default router;