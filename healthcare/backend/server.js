import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import healthLogRoutes from './routes/healthLogRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import adviceRoutes from './routes/adviceRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
dotenv.config();

// Kết nối database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/healthLogs', healthLogRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/advice', adviceRoutes);
app.use('/api/stats', statsRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server đang hoạt động tốt!' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});