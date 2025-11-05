import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scoresSet1: {
    type: [Number],
    required: [true, 'Score Set 1 is required.'],
    validate: { validator: (arr) => arr.length === 25, message: 'Set 1 must have 25 answers.' },
  },
  scoresSet2: {
    type: [Number],
    validate: { validator: (arr) => arr.length === 25, message: 'Set 2 must have 25 answers.' },
    default: undefined, // This makes it optional
  },
  scoresSet3: {
    type: [Number],
    validate: { validator: (arr) => arr.length === 20, message: 'Set 3 must have 20 answers.' },
    default: undefined, // This makes it optional
  },
  riskLevel: { type: String },
  totalScore: { type: Number }, // This is the weighted score
  questionsAnswered: { type: Number },
  
  // This field stores the user's final percentage (0-100)
  // It's used to calculate the dynamic thresholds for new users.
  percentage: { 
    type: Number 
  }
}, { timestamps: true });

// This logic prevents Mongoose from recompiling the model during hot-reloads
const Survey = mongoose.models.Survey || mongoose.model("Survey", surveySchema);

export default Survey;