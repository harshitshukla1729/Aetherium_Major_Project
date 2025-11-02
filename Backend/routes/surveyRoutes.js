// routes/surveyRoutes.js
import express from "express";
import { submitSurvey } from "../controllers/surveyController.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.post("/submit", protect, submitSurvey);

export default router;
