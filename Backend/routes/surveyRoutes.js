// routes/surveyRoutes.js
import express from "express";
import { submitSurvey } from "../controllers/surveyController.js";
import { protect, attachUserIfPresent} from "../middleware/authMiddleware.js"; 

const router = express.Router();

//router.post("/submit", protect, submitSurvey);
router.post("/submit", attachUserIfPresent, submitSurvey);
export default router;
