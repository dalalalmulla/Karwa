import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './src/config/database';
import { errorHandler } from './src/middleware/errorHandler';
import authRoutes from './src/routes/auth';
import taskRoutes from './src/routes/tasks';
import notificationRoutes from './src/routes/notifications';
import ratingRoutes from './src/routes/ratings';
import applicationRoutes from './src/routes/applications';
import uploadRoutes from './src/routes/uploads';
import morgan from "morgan";


// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan("dev"))

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/uploads', uploadRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
