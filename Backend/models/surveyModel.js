// models/surveyModel.js
import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scoresPart1: {
    type: [Number],
    required: true,
    validate: {
      validator: (arr) => arr.length === 25 && arr.every(score => score >= 1 && score <= 5),
      message: 'Scores for Part 1 must be an array of 20 numbers between 1 and 5.',
    },
  },
  scoresPart2: {
    type: [Number],
    required: true,
    validate: {
      validator: (arr) => arr.length === 5 && arr.every(score => score >= 1 && score <= 5),
      message: 'Scores for Part 2 must be an array of 5 numbers between 1 and 5.',
    },
  },
  totalScorePart1: {
    type: Number,
    required: true,
  },
  totalScorePart2: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Survey = mongoose.models.Survey || mongoose.model("Survey", surveySchema);

export default Survey;
