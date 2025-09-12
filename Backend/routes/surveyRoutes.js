// routes/surveyRoutes.js
import express from "express";
import { submitSurvey } from "../controllers/surveyController.js";
import { protect } from "../middleware/authMiddleware.js"; // Placeholder for an auth middleware

const router = express.Router();

// POST request to submit a survey. The 'protect' middleware ensures only authenticated users can submit.
router.post("/submit", protect, submitSurvey);

export default router;
