import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';
// import '../types/express'; // Ensure Express Request type extensions are loaded
import { CustomeRequest } from '../types/http';

// Helper function to calculate points based on money amount
const calculatePoints = (money: number): number => {
  // Points calculation: 1 point per 1 KWD (or currency unit)
  // You can adjust this formula as needed
  return Math.floor(money);
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
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

    const { title, description, pictures, money, location, type } = req.body;

    // Validate required fields
    if (!title || !description || !money || !location || !type) {
      res.status(400).json({
        success: false,
        error: 'Title, description, money, location, and type are required',
      });
      return;
    }

    // Validate task type
    const validTypes = ['indoor', 'outdoor', 'home_service', 'car_service'];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        success: false,
        error: 'Invalid task type. Must be one of: indoor, outdoor, home_service, car_service',
      });
      return;
    }

    // Validate money is positive
    if (money <= 0) {
      res.status(400).json({
        success: false,
        error: 'Money amount must be greater than 0',
      });
      return;
    }

    // Calculate points automatically
    const points = calculatePoints(money);

    // Create task - Mongoose accepts string for ObjectId fields
    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      pictures: pictures || [],
      money: Number(money),
      location: location.trim(),
      type,
      points,
      status: 'OPEN',
      posterId: userId, // Mongoose will convert string to ObjectId automatically
    });

    res.status(201).json({
      success: true,
      data: {
        task: {
          _id: task._id,
          title: task.title,
          description: task.description,
          pictures: task.pictures,
          money: task.money,
          location: task.location,
          type: task.type,
          points: task.points,
          status: task.status,
          posterId: task.posterId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Create task error:', error);

    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((e) => e.message);
      res.status(400).json({
        success: false,
        error: errors.join(', '),
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create task. Please try again.',
    });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type } = req.query;

    // Build query
    const query: Record<string, unknown> = {};

    // Filter by status (default to OPEN for marketplace)
    if (status) {
      query.status = status;
    } else {
      query.status = 'OPEN'; // Default to showing open tasks in marketplace
    }

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Get tasks, sorted by newest first
    const tasks = await Task.find(query)
      .populate('posterId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent performance issues

    res.status(200).json({
      success: true,
      data: {
        tasks: tasks.map((task) => {
          // Handle populated posterId (could be ObjectId or populated object)
          let posterId: string | { _id: string; firstName?: string; lastName?: string; email: string };

          if (task.posterId && typeof task.posterId === 'object' && 'email' in task.posterId) {
            // Populated user object
            const user = task.posterId as unknown as { _id: mongoose.Types.ObjectId; firstName?: string; lastName?: string; email: string };
            posterId = {
              _id: user._id.toString(),
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            };
          } else {
            // Just ObjectId - convert to string
            posterId = task.posterId.toString();
          }

          return {
            _id: task._id,
            title: task.title,
            description: task.description,
            pictures: task.pictures,
            money: task.money,
            location: task.location,
            type: task.type,
            points: task.points,
            status: task.status,
            posterId,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          };
        }),
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
    });
  }
};

