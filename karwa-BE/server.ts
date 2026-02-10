import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import net from 'net';
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
  origin: '*', // Allow all origins for mobile development (restrict in production)
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

// Helper function to check if port is available
const checkPort = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
};

// Helper to get network IP for logging
function getNetworkIP() {
  const interfaces = require('os').networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost'; // Fallback
}

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Check if port is available
    const portAvailable = await checkPort(Number(PORT));
    if (!portAvailable) {
      console.error(`❌ Port ${PORT} is already in use.`);
      console.error(`   Please run: lsof -ti:${PORT} | xargs kill -9`);
      console.error(`   Or wait a few seconds for the previous instance to close.`);
      // Don't exit - let nodemon retry after file changes
      return;
    }

    await connectDatabase();

    // Listen on 0.0.0.0 to allow connections from mobile devices on the same network
    const server = app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`🌐 Server is accessible from network at http://${getNetworkIP()}:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors (like port already in use)
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please kill the process using this port or wait a moment for it to close.`);
        console.error(`   Run: lsof -ti:${PORT} | xargs kill -9`);
        // Don't exit immediately - let nodemon handle the restart
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
