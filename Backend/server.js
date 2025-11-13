import dotenv from 'dotenv';
import 'dotenv/config'; // Loads the .env file
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import activityRoutes from "./routes/activityRoutes.js";
import cors from 'cors';
import screenTimeRoutes from "./routes/screenTimeRoutes.js";
import plannerRoutes from "./routes/plannerRoutes.js"; //dotenv.config();
import metricsRoutes from './routes/metricsRoutes.js'; 
import agentRoutes from './routes/agentRoutes.js'
const app = express();

// app.use(cors()); // allows any origin

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.options(/.*/, cors());



app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/planner', plannerRoutes);
app.use("/api/activities", activityRoutes);
app.use('/api/agent',agentRoutes)
// app.use("/api/planner", plannerRoutes);
app.get('/', (req, res) => res.json('hello world'));
app.use("/api/screentime", screenTimeRoutes);
// app.use("/api/planner", plannerRoutes);
// DB connection
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
