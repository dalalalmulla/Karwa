import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';
import Application from '../models/Application';
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

// Get task by ID with details
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const customReq = req as CustomeRequest;
    const userId = customReq.user?._id;
    const { taskId } = req.params;

    // Validate taskId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid task ID format',
      });
      return;
    }

    // Get task with populated poster info including rating
    const task = await Task.findById(taskId).populate('posterId', 'firstName lastName email rating');

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    // Handle populated posterId
    let poster: { _id: string; firstName?: string; lastName?: string; email: string; rating?: number };

    if (task.posterId && typeof task.posterId === 'object' && 'email' in task.posterId) {
      const user = task.posterId as unknown as {
        _id: mongoose.Types.ObjectId;
        firstName?: string;
        lastName?: string;
        email: string;
        rating?: number;
      };
      poster = {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        rating: user.rating || 0,
      };
    } else {
      // Fallback if not populated (shouldn't happen, but handle it)
      poster = {
        _id: task.posterId.toString(),
        email: '',
        rating: 0,
      };
    }

    // Check if current user has applied to this task
    let hasApplied = false;
    if (userId) {
      const application = await Application.findOne({
        workerId: userId,
        taskId: task._id,
      });
      hasApplied = !!application;
    }

    // Get applications list (only if user is the poster)
    let applications: Array<{
      _id: string;
      workerId: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email: string;
      };
      status: string;
      createdAt: Date;
    }> = [];

    const isPoster = userId && task.posterId.toString() === userId;
    if (isPoster) {
      const taskApplications = await Application.find({ taskId: task._id })
        .populate('workerId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      applications = taskApplications.map((app) => {
        const worker = app.workerId as unknown as {
          _id: mongoose.Types.ObjectId;
          firstName?: string;
          lastName?: string;
          email: string;
        };

        return {
          _id: app._id.toString(),
          workerId: {
            _id: worker._id.toString(),
            firstName: worker.firstName,
            lastName: worker.lastName,
            email: worker.email,
          },
          status: app.status,
          createdAt: app.createdAt,
        };
      });
    }

    res.status(200).json({
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
          poster: {
            _id: poster._id,
            firstName: poster.firstName,
            lastName: poster.lastName,
            email: poster.email,
            rating: poster.rating || 0,
          },
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          hasApplied,
          applications: isPoster ? applications : undefined,
        },
      },
    });
  } catch (error) {
    console.error('Get task by ID error:', error);

    // Handle Mongoose cast errors (invalid ObjectId)
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        error: 'Invalid task ID',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch task details',
    });
  }
};

