// controllers/surveyController.js
import Survey from "../models/surveyModel.js";

export const submitSurvey = async (req, res) => {
  try {
    const { scoresPart1, scoresPart2 } = req.body;
    const userId = req.user.id; // Assuming you have a user ID from a JWT token

    // Validate that both parts are present and of the correct length
    if (!scoresPart1 || scoresPart1.length !== 25 || !scoresPart2 || scoresPart2.length !== 5) {
      return res.status(400).json({ message: "Invalid survey data. Requires 25 scores for part 1 and 5 for part 2." });
    }

    // Calculate the total scores for each part
    const totalScorePart1 = scoresPart1.reduce((acc, score) => acc + score, 0);
    const totalScorePart2 = scoresPart2.reduce((acc, score) => acc + score, 0);

    // Create a new survey response document
    const surveyResponse = await Survey.create({
      userId,
      scoresPart1,
      scoresPart2,
      totalScorePart1,
      totalScorePart2,
    });

    res.status(201).json({
      message: "Survey submitted successfully",
      data: {
        totalScorePart1,
        totalScorePart2,
        surveyResponse,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
