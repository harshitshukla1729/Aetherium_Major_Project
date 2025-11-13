import dotenv from 'dotenv';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import activityRoutes from "./routes/activityRoutes.js";
import cors from 'cors';
import screenTimeRoutes from "./routes/screenTimeRoutes.js";
import plannerRoutes from "./routes/plannerRoutes.js";
import metricsRoutes from './routes/metricsRoutes.js'; 
import agentRoutes from './routes/agentRoutes.js';

const app = express();

// FIXED CORS — SAFE FOR EXPRESS v5
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  credentials: true,
}));

app.use(express.json());

// ROUTES
app.use('/auth', authRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/planner', plannerRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/screentime", screenTimeRoutes);

app.get('/', (req, res) => res.json('hello world'));

// DB connection + START SERVER
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error('MongoDB error:', err));
