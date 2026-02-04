import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/token';
import { CustomeRequest } from '../types/http';

// Import Rating, Application, and Task models
import Rating from '../models/Rating';
import Application from '../models/Application';
import Task from '../models/Task';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, name, civilId } = req.body;

    // Handle name field - split into firstName and lastName if provided
    let finalFirstName = firstName;
    let finalLastName = lastName;

    if (name && !firstName && !lastName) {
      const nameParts = name.trim().split(/\s+/);
      finalFirstName = nameParts[0] || '';
      finalLastName = nameParts.slice(1).join(' ') || '';
    }

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: finalFirstName,
      lastName: finalLastName,
      civilId: civilId?.trim(),
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Return user data (without password)
    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          civilId: user.civilId,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);

    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((e: mongoose.Error.ValidatorError) => e.message);
      res.status(400).json({
        success: false,
        error: errors.join(', '),
      });
      return;
    }

    // Handle duplicate key error
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to register user. Please try again.',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Return user data (without password)
    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((e: mongoose.Error.ValidatorError) => e.message);
      res.status(400).json({
        success: false,
        error: errors.join(', '),
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to login. Please try again.',
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req as CustomeRequest
    const userId = q.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Calculate profile statistics
    let ratingAverage = 0;
    let completedTasksCount = 0;
    let earnedPoints = 0;
    let notificationCount = 0;

    try {
      // Calculate rating average from Rating model
      const ratings = await Rating.find({ ratedUserId: new mongoose.Types.ObjectId(userId) });
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc: number, r: any) => acc + r.score, 0);
        ratingAverage = sum / ratings.length;
      }

      // Calculate completed tasks count from Application model
      // ACCEPTED status means the task was completed
      completedTasksCount = await Application.countDocuments({
        applicantId: new mongoose.Types.ObjectId(userId),
        status: 'ACCEPTED'
      });

      // Calculate earned points from user's points field (points are added when tasks are completed)
      earnedPoints = user.points || 0;

      // Calculate notification count (pending applications for user's posted tasks)
      const userIdObj = new mongoose.Types.ObjectId(userId);
      const userPostedTasks = await Task.find({ posterId: userIdObj }).select('_id');
      const taskIds = userPostedTasks.map(t => t._id);

      if (taskIds.length > 0) {
        notificationCount = await Application.countDocuments({
          taskId: { $in: taskIds },
          status: 'PENDING'
        });
      }
    } catch (modelError) {
      // Error calculating, use default values
      console.log('Error calculating profile statistics:', modelError);
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          ratingAverage: Math.round(ratingAverage * 10) / 10, // Round to 1 decimal place
          completedTasksCount,
          earnedPoints,
          notificationCount,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);

    // Handle Mongoose cast errors (invalid ObjectId)
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data',
    });
  }
};
