import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import activityRoutes from "./routes/activityRoutes.js";
import cors from 'cors';
import screenTimeRoutes from "./routes/screenTimeRoutes.js";
dotenv.config();

const app = express();

// app.use(cors()); // allows any origin

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.options(/.*/, cors());



app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/survey', surveyRoutes);
app.use("/api/activities", activityRoutes);
app.get('/', (req, res) => res.json('hello world'));
app.use("/api/screentime", screenTimeRoutes);
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
