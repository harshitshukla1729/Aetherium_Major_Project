// server/controllers/PlannerController.js

import Survey from '../models/surveyModel.js';
import { callAIAgent } from '../services/aiService.js';

export const generatePlan = async (req, res) => {
  try {
    const startTime = Date.now(); 
    let dbFetchTime = 0;
    let aiCallTime = 0;
    // 1. Validate request
    const { activities } = req.body;
    if (!activities || activities.length === 0) {
      return res.status(400).json({ message: 'No activities selected.' });
    }

    // 2. Fetch latest survey for this user (schema uses `userId`)
    const dbFetchStart = Date.now();
    const latestSurvey = await Survey.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    dbFetchTime = Date.now() - dbFetchStart;
    if (!latestSurvey) {
      return res.status(404).json({ message: 'No survey found for this user. Please take the survey first.' });
    }

    // 3. Call AI service - callAIAgent() returns a parsed JSON array (or a safe fallback)
    const aiCallStart = Date.now();
    const schedule = await callAIAgent(latestSurvey, activities);
    aiCallTime = Date.now() - aiCallStart;

    // 4. Sanity-check the returned schedule
    if (!schedule || !Array.isArray(schedule)) {
      console.error('CRITICAL: AI returned invalid schedule:', schedule);
      if (!res.headersSent) return res.status(500).json({ message: 'AI returned an invalid plan.' });
      return;
    }

    // 5. Respond once with the schedule
    const totalTime = Date.now() - startTime;
    console.log(`[METRICS] Request /api/planner/generate completed.`);
    console.log(`[METRICS] Database latency `,dbFetchTime);
    console.log(`[METRICS] AI Call Time `,dbFetchTime);


    return res.status(200).json({ schedule });

  } catch (error) {
    // Single error handler that logs and responds only if headers not sent
    const totalTime = Date.now() - startTime;
    console.log(`[METRICS] FAILED Request Duration: ${totalTime}ms`);
    console.error('CRITICAL: Error in generatePlan controller:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  }
};