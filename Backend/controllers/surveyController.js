import Survey from '../models/surveyModel.js';

// --- (NEW) Data-Driven Weighted Risk Mapping ---
// Based on analysis of the 180-response sample, we can identify
// questions that are stronger indicators of dependency.

// --- SET 1 (Indices 0-24) ---
// High-risk indicators (Weight x3)
const SET1_HIGH_RISK = [5, 7, 9, 10, 11, 22, 23, 24]; 
// (Q6: restless if phone given up, Q8: escape problems, Q10: hide habits, Q11: habits affect stress, 
// Q12: difficult to focus, Q23: lost control, Q24: comfort online, Q25: 'just 5 more mins')

// Moderate-risk indicators (Weight x2)
const SET1_MODERATE_RISK = [0, 1, 2, 3, 4, 6, 8, 12, 13, 14, 15, 18, 19, 20, 21]; 
// Note: Q17 (index 16) is handled by the "inverted" logic below.

// --- SET 2 (Indices 0-24) ---
// High-risk indicators (Weight x3)
const SET2_HIGH_RISK = [5, 6, 10, 14, 15, 18, 20, 22, 23, 24];
// (Q31: offline boring, Q32: procrastinate, Q36: ignore trackers, Q40: full day is hard, 
// Q41: sleep worsened, Q44: regret but continue, Q46: grades/work dropped, 
// Q48: forget real-life problems, Q49: worry about missing out, Q50: surprised at hours)

// Moderate-risk indicators (Weight x2)
const SET2_MODERATE_RISK = [0, 1, 3, 7, 8, 12, 13, 16, 17, 19, 21];

// --- SET 3 (Indices 0-19) ---
// High-risk indicators (Weight x3)
const SET3_HIGH_RISK = [0, 1, 2, 4, 6, 7, 8, 9, 12, 13, 18, 19];
// (Q51: failed to cut down, Q52: skip physical activities, Q53: phone for loneliness, 
// Q55: lied, Q57: bedtime routine, Q58: offline hobbies reduced, Q59: phone to distract from stress,
// Q60: offline opportunities suffered, Q63: social relationships weakened, Q64: skip meals/sleep, 
// Q69: missed deadline, Q70: calmer after checking)

// Moderate-risk indicators (Weight x2)
const SET3_MODERATE_RISK = [3, 5, 10, 11, 14, 15, 16, 17];

// --- (UPDATED) Analysis "ML" Algorithm (Weighted Model) ---
// This function now takes DYNAMIC thresholds as arguments
const analyzeSurveyResults = (scoresSet1, scoresSet2, scoresSet3, thresholds) => {
  
  let weightedScore = 0;
  let maxPossibleWeightedScore = 0;
  let minPossibleWeightedScore = 0;
  let questionsAnswered = 0;

  // This is the index of the inverted question
  const SET1_INVERTED_INDEX = 16; // Q17: "Do you feel more productive when you stay away from screens?"

  const processSet = (scores, setNum) => {
    if (!scores || scores.length === 0) return;

    let highRisk, moderateRisk;
    if (setNum === 1) {
      highRisk = SET1_HIGH_RISK;
      moderateRisk = SET1_MODERATE_RISK;
    } else if (setNum === 2) {
      highRisk = SET2_HIGH_RISK;
      moderateRisk = SET2_MODERATE_RISK;
    } else {
      highRisk = SET3_HIGH_RISK;
      moderateRisk = SET3_MODERATE_RISK;
    }

    scores.forEach((score, index) => {
      let weight = 1; // Default low risk
      if (highRisk.includes(index)) {
        weight = 3; // High risk
      } else if (moderateRisk.includes(index)) {
        weight = 2; // Moderate risk
      }

      let riskScore = score;
      
      // --- NEW LOGIC ---
      // Invert the score for the specific "positive" question
      if (setNum === 1 && index === SET1_INVERTED_INDEX) {
        // A user answering 1 (Strongly Disagree) is high risk (5)
        // A user answering 5 (Strongly Agree) is low risk (1)
        // Formula: (Max Score + 1) - User Score
        riskScore = (5 + 1) - score;
      }
      // --- END NEW LOGIC ---

      weightedScore += riskScore * weight;
      maxPossibleWeightedScore += 5 * weight; // Max possible risk score
      minPossibleWeightedScore += 1 * weight; // Min possible risk score
      questionsAnswered++;
    });
  };

  // Process all available sets
  processSet(scoresSet1, 1);
  processSet(scoresSet2, 2);
  processSet(scoresSet3, 3);

  // Calculate percentage based on the weighted scores
  const percentage = (maxPossibleWeightedScore - minPossibleWeightedScore) > 0 
    ? ((weightedScore - minPossibleWeightedScore) / (maxPossibleWeightedScore - minPossibleWeightedScore)) * 100 
    : 0;

  let riskLevel = "";
  let suggestions = "";

  // --- DYNAMIC THRESHOLDS ---
  // Use the calculated percentiles from the database instead of static 33/66
  if (percentage < thresholds.p33) {
    riskLevel = "Low Risk";
    suggestions = "Based on your responses, your digital habits appear balanced and healthy compared to others. Keep maintaining this positive mix of online and offline activities.";
  } else if (percentage < thresholds.p66) {
    riskLevel = "Moderate Risk";
    suggestions = "Your responses indicate some potential issues with digital dependency, especially regarding its impact on your daily tasks and mood. This is a common pattern. We suggest you start actively scheduling 'offline' time and try setting some goals in your Activity Tracker.";
  } else {
    riskLevel = "High Risk";
    suggestions = "Your survey responses show a high level of dependency on digital devices, which appears to be impacting your productivity and well-being. We strongly recommend setting firm boundaries and using the Activity Tracker to build healthier habits. It may also be beneficial to speak with a friend, family member, or professional.";
  }

  // Add Hindi suggestions
  if (percentage < thresholds.p33) {
    suggestions += "\n\n(आपकी डिजिटल आदतें संतुलित लगती हैं। ऑनलाइन और ऑफलाइन गतिविधियों का यह स्वस्थ मिश्रण बनाए रखें।)";
  } else if (percentage < thresholds.p66) {
    suggestions += "\n\n(आपके जवाब डिजिटल निर्भरता के कुछ संभावित मुद्दों का संकेत देते हैं। हम सुझाव देते हैं कि आप सक्रिय रूप से 'ऑफलाइन' समय निर्धारित करना शुरू करें।)";
  } else {
    suggestions += "\n\n(आपके जवाब डिजिटल उपकरणों पर उच्च स्तर की निर्भरता दिखाते हैं। हम दृढ़ता से सीमाओं को निर्धारित करने की सलाह देते हैं। सक्रिय रूप से ऑफ़लाइन शौक निर्धारित करें।)";
  }

  if (questionsAnswered < 70 && questionsAnswered > 0) {
    suggestions += " This is a preliminary assessment based on the sets you completed. For a more complete picture, we encourage you to complete the remaining sets when you have time.";
  } else if (questionsAnswered === 70) {
    suggestions += " You have completed the full survey. This assessment is based on all your responses.";
  }

  return {
    riskLevel,
    suggestions,
    totalScore: weightedScore, // Now stores the weighted score
    questionsAnswered,
    percentage: parseFloat(percentage.toFixed(1)),
  };
};

// @desc    Submit a new survey (now handles partial submissions)
// @route   POST /api/survey/submit
// @access  Private
export const submitSurvey = async (req, res) => {
  try {
    const { scoresSet1, scoresSet2, scoresSet3 } = req.body;

    // Validation - Only Set 1 is required
    if (!scoresSet1 || !Array.isArray(scoresSet1) || scoresSet1.length !== 25) {
      return res.status(400).json({ message: 'Score Set 1 is required and must contain 25 answers.' });
    }
    if (scoresSet2 && (!Array.isArray(scoresSet2) || scoresSet2.length !== 25)) {
      return res.status(400).json({ message: 'Score Set 2 must contain 25 answers.' });
    }
    if (scoresSet3 && (!Array.isArray(scoresSet3) || scoresSet3.length !== 20)) {
      return res.status(400).json({ message: 'Score Set 3 must contain 20 answers.' });
    }

    // --- NEW: DYNAMIC THRESHOLD CALCULATION ---
    // 1. Get the current percentile thresholds from *all* users
    const stats = await Survey.aggregate([
      {
        $group: {
          _id: null,
          percentiles: {
            $percentile: {
              input: "$percentage", // Use the stored percentage field
              p: [0.33, 0.66],     // Get the 33rd and 66th percentiles
              method: 'approximate'
            }
          }
        }
      }
    ]);

    let thresholds = { p33: 33.3, p66: 66.6 }; // Default fallback values

    if (stats && stats.length > 0 && stats[0].percentiles && stats[0].percentiles.length === 2) {
      thresholds = {
        p33: stats[0].percentiles[0],
        p66: stats[0].percentiles[1],
      };
    }
    // --- END DYNAMIC THRESHOLD CALCULATION ---


    // 2. Run Analysis for the *current user* using the dynamic thresholds
    const assessment = analyzeSurveyResults(scoresSet1, scoresSet2, scoresSet3, thresholds);

    // 3. Prepare data for the database
    const surveyData = {
      userId: req.user.id,
      scoresSet1,
      riskLevel: assessment.riskLevel,
      totalScore: assessment.totalScore, // Store the new weighted score
      questionsAnswered: assessment.questionsAnswered,
      percentage: assessment.percentage, // Store the user's percentage
    };

    // Only add sets to the DB if they were submitted
    if (scoresSet2) {
      surveyData.scoresSet2 = scoresSet2;
    }
    if (scoresSet3) {
      surveyData.scoresSet3 = scoresSet3;
    }

    // 4. Use findOneAndUpdate to create or update the survey for the user
    // This ensures one user has only one survey response
    const updatedSurvey = await Survey.findOneAndUpdate(
      { userId: req.user.id }, // Find by user ID
      surveyData, // Data to update or insert
      { 
        new: true, // Return the new/updated document
        upsert: true, // Create a new document if one doesn't exist
        runValidators: true, // Run schema validation
      }
    );

    // 5. Send the assessment results back to the frontend
    res.status(201).json({ 
      message: 'Survey submitted successfully!',
      data: updatedSurvey,
      assessment: assessment // Send the new assessment object
    });

  } catch (error) {
    console.error("Error submitting survey:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while submitting survey.' });
  }
};