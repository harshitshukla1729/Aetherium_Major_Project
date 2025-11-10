import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const systemPrompt = `
You are an expert digital wellness planner helping users reduce screen time.
You will generate BOTH **daily** and **weekly** goals, and also rate activities by how strongly you recommend them.

### Rules:
1. Respond ONLY in valid JSON (no markdown, no commentary).
2. Include 5–7 activities based on user preferences.
3. Each activity must include:
   - "day": e.g., "Saturday", "Monday"
   - "activity": string (short, clear)
   - "duration": integer (total time in minutes)
   - "goalType": "Daily" or "Weekly"
   - "reason": one-sentence motivation
   - "priority": "high" for heavily recommended, "normal" for others
   - "isRecommended": true
4. At least 2–3 activities should be 'priority': 'high'
5. Example output:
[
  { "day": "Saturday", "activity": "Hiking", "duration": 120, "goalType": "Weekly", "reason": "Great for focus and fitness.", "priority": "high", "isRecommended": true },
  { "day": "Monday", "activity": "Yoga", "duration": 30, "goalType": "Daily", "reason": "Calms the mind.", "priority": "normal", "isRecommended": true }
]
`;



export const callAIAgent = async (latestSurvey, preferences) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const userPrompt = `
Survey Assessment: ${JSON.stringify({
    riskLevel: latestSurvey?.riskLevel ?? "Unknown",
    percentage: latestSurvey?.percentage ?? 0,
    actionableGoal: latestSurvey?.actionableGoal ?? "Reduce screen time.",
  })}
User Preferences: ${JSON.stringify(preferences)}
`;

  try {
    const result = await model.generateContent([
      `${systemPrompt}\n\n${userPrompt}`,
    ]);

    let aiText = result.response.text();
    console.log("Raw AI text:\n", aiText);

    // ---- SANITIZE -------------------------------------------------------
    aiText = aiText.replace(/```json|```/gi, "").trim();

    // find JSON array
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn("No JSON array found in AI output.");
      return defaultPlan(preferences);
    }

    let jsonString = jsonMatch[0];

    // single → double quotes
    jsonString = jsonString.replace(/'/g, '"');
    // quote unquoted keys
    jsonString = jsonString.replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');

    try {
      const parsed = JSON.parse(jsonString);
      console.log("Parsed plan:", parsed);
      return parsed;
    } catch (err) {
      console.error("JSON.parse failed:", err.message);
      console.error("Sanitized text:", jsonString);
      return defaultPlan(preferences);
    }
  } catch (error) {
    console.error("Gemini call failed:", error.message);
    return defaultPlan(preferences);
  }
};

// ------------------------------------------------------------------------
// Simple fallback so backend always returns something
function defaultPlan(preferences = []) {
  const sampleActivity = preferences[0] || "Walking";
  return [
    {
      day: "Saturday",
      activity: sampleActivity,
      duration: "1 hour",
      reason: "Default fallback plan while AI is unavailable.",
    },
    {
      day: "Sunday",
      activity: "Outdoor relaxation",
      duration: "45 minutes",
      reason: "Fallback suggestion for a calm weekend.",
    },
  ];
}
