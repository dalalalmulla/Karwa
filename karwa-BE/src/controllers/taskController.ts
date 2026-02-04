import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task, { TaskType } from '../models/Task';

// Calculate points based on task type and money
const calculatePoints = (type: TaskType, money: number): number => {
  const basePoints = Math.floor(money / 10); // 1 point per 10 money units
  
  const typeMultipliers: Record<TaskType, number> = {
    indoor: 1.0,
    outdoor: 1.2,
  };
  
  return Math.floor(basePoints * typeMultipliers[type]);
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

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
    const validTypes: TaskType[] = ['indoor', 'outdoor'];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        success: false,
        error: 'Invalid task type. Must be one of: indoor, outdoor',
      });
      return;
    }

    // Validate money is positive
    if (money <= 0) {
      res.status(400).json({
        success: false,
        error: 'Amount in KWD must be greater than 0',
      });
      return;
    }

    // Calculate points automatically
    const points = calculatePoints(type, money);

    // Create task
    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      pictures: Array.isArray(pictures) ? pictures : [],
      money: Number(money),
      location: location.trim(),
      type: type as TaskType,
      points,
      status: 'OPEN',
      posterId: new mongoose.Types.ObjectId(userId),
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
    
    const filter: any = {};
    
    // Filter by status if provided
    if (status) {
      filter.status = status;
    } else {
      // Default: only show OPEN tasks in marketplace
      filter.status = 'OPEN';
    }
    
    // Filter by type if provided
    if (type) {
      filter.type = type;
    }

    const tasks = await Task.find(filter)
      .populate('posterId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        tasks,
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

