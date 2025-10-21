import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"; 
import surveyRoutes from "./routes/surveyRoutes.js"
import cors from "cors";
dotenv.config();

const app = express();

app.use(cors()); // allows any origin

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/survey", surveyRoutes);
app.get("/",(req,res)=>res.json("hello world"));
// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
