import express from 'express';
import { handleChat } from '../controllers/agentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// This route will be called by your AgentSurvey.jsx component
// We 'protect' it to make sure the user is logged in
router.post('/chat', protect, handleChat);

export default router;