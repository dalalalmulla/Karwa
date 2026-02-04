import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task, { TaskType } from '../models/Task';
import Application from '../models/Application';
import Rating from '../models/Rating';
import User from '../models/User';
import { CustomeRequest } from '../types/http';

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
        error: 'Money amount in KWD must be greater than 0',
      });
      return;
    }

    // Calculate points automatically
    const points = calculatePoints(type, money);

    // Create task - Mongoose accepts string for ObjectId fields
    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      pictures: Array.isArray(pictures) ? pictures : [],
      money: Number(money),
      location: location.trim(),
      type: type as TaskType,
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
    const q = req as CustomeRequest;
    const { status, type, location, minMoney, maxMoney, posterId: posterIdParam } = req.query;

    // Build query
    const query: Record<string, unknown> = {};

    // Filter by poster (e.g. ?posterId=me for current user's tasks as poster)
    if (posterIdParam === 'me' && q.user?._id) {
      query.posterId = q.user._id;
    }

    // Filter by status (default to OPEN for marketplace when no posterId=me)
    if (status) {
      query.status = status;
    } else if (!query.posterId) {
      query.status = 'OPEN'; // Default to showing open tasks in marketplace
    }

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Filter by location (case-insensitive partial match)
    if (location && typeof location === 'string') {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Filter by money range
    if (minMoney || maxMoney) {
      query.money = {};
      if (minMoney) {
        (query.money as Record<string, number>).$gte = Number(minMoney);
      }
      if (maxMoney) {
        (query.money as Record<string, number>).$lte = Number(maxMoney);
      }
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

          const assignedWorkerId = task.assignedWorkerId
            ? (task.assignedWorkerId as mongoose.Types.ObjectId).toString()
            : undefined;

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
            assignedWorkerId,
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

// Helper to format populated user for response
function formatPopulatedUser(user: unknown): { _id: string; firstName?: string; lastName?: string; email: string; rating?: number } | string {
  if (!user || typeof user !== 'object' || !('_id' in user)) return '';
  const u = user as { _id: mongoose.Types.ObjectId; firstName?: string; lastName?: string; email: string; rating?: number };
  return {
    _id: u._id.toString(),
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    rating: u.rating,
  };
}

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req as CustomeRequest;
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Valid task ID is required' });
      return;
    }

    const task = await Task.findById(id)
      .populate('posterId', 'firstName lastName email')
      .populate('assignedWorkerId', 'firstName lastName email rating');

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    let hasRatedByPoster = false;
    if (q.user?._id) {
      const ratingExists = await Rating.exists({ taskId: id, raterId: q.user._id });
      hasRatedByPoster = !!ratingExists;
    }

    const applications = await Application.find({ taskId: id, status: 'PENDING' })
      .populate('applicantId', 'firstName lastName email rating')
      .sort({ createdAt: -1 });

    const posterId = formatPopulatedUser(task.posterId);
    const assignedWorkerId = task.assignedWorkerId
      ? formatPopulatedUser(task.assignedWorkerId)
      : undefined;

    const applicants = applications.map((app) => {
      const applicant = formatPopulatedUser(app.applicantId);
      return {
        _id: app._id.toString(),
        applicantId: typeof applicant === 'object' ? applicant : { _id: app.applicantId.toString() },
        status: app.status,
        createdAt: app.createdAt,
      };
    });

    // Normalize applicantId to always be object with rating for frontend
    const applicantsFormatted = applicants.map((a) => ({
      _id: a._id,
      applicantId: typeof a.applicantId === 'object' ? a.applicantId : { _id: a.applicantId, rating: undefined },
      status: a.status,
      createdAt: a.createdAt,
    }));

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
          posterId,
          assignedWorkerId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        },
        applicants: applicantsFormatted,
        hasRatedByPoster,
      },
    });
  } catch (error) {
    console.error('Get task by id error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
    });
  }
};

export const applyToTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req as CustomeRequest;
    const userId = q.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const { id: taskId } = req.params;
    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      res.status(400).json({ success: false, error: 'Valid task ID is required' });
      return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    if (task.status !== 'OPEN') {
      res.status(400).json({ success: false, error: 'Task is not open for applications' });
      return;
    }
    if (task.posterId.toString() === userId) {
      res.status(400).json({ success: false, error: 'You cannot apply to your own task' });
      return;
    }

    const existing = await Application.findOne({ taskId, applicantId: userId });
    if (existing) {
      res.status(400).json({ success: false, error: 'You have already applied to this task' });
      return;
    }

    const application = await Application.create({
      taskId,
      applicantId: userId,
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      data: {
        application: {
          _id: application._id,
          taskId: application.taskId,
          applicantId: application.applicantId,
          status: application.status,
          createdAt: application.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Apply to task error:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((e) => e.message);
      res.status(400).json({ success: false, error: errors.join(', ') });
      return;
    }
    res.status(500).json({
      success: false,
      error: 'Failed to apply to task',
    });
    return;
  }
};

export const assignWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req as CustomeRequest;
    const posterId = q.user?._id;
    if (!posterId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const { id: taskId } = req.params;
    const { applicantId } = req.body;

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      res.status(400).json({ success: false, error: 'Valid task ID is required' });
      return;
    }
    if (!applicantId || !mongoose.Types.ObjectId.isValid(applicantId)) {
      res.status(400).json({ success: false, error: 'Valid applicant ID is required' });
      return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    if (task.posterId.toString() !== posterId) {
      res.status(403).json({ success: false, error: 'Only the poster can assign a worker' });
      return;
    }
    if (task.status !== 'OPEN') {
      res.status(400).json({ success: false, error: 'Task is not open for assignment' });
      return;
    }

    const application = await Application.findOne({ taskId, applicantId, status: 'PENDING' });
    if (!application) {
      res.status(400).json({ success: false, error: 'Applicant not found or already processed' });
      return;
    }

    task.assignedWorkerId = new mongoose.Types.ObjectId(applicantId);
    task.status = 'IN_PROGRESS';
    await task.save();

    await Application.updateOne({ _id: application._id }, { status: 'ACCEPTED' });
    await Application.updateMany(
      { taskId, _id: { $ne: application._id } },
      { status: 'REJECTED' }
    );

    const updated = await Task.findById(taskId)
      .populate('posterId', 'firstName lastName email')
      .populate('assignedWorkerId', 'firstName lastName email rating');

    const posterFormatted = formatPopulatedUser(updated!.posterId);
    const assignedWorkerFormatted = updated!.assignedWorkerId
      ? formatPopulatedUser(updated!.assignedWorkerId)
      : undefined;

    res.status(200).json({
      success: true,
      data: {
        task: {
          _id: updated!._id,
          title: updated!.title,
          description: updated!.description,
          pictures: updated!.pictures,
          money: updated!.money,
          location: updated!.location,
          type: updated!.type,
          points: updated!.points,
          status: updated!.status,
          posterId: posterFormatted,
          assignedWorkerId: assignedWorkerFormatted,
          createdAt: updated!.createdAt,
          updatedAt: updated!.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Assign worker error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign worker',
    });
  }
};

export const markCompleteByWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req as CustomeRequest;
    const workerId = q.user?._id;
    if (!workerId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const { id: taskId } = req.params;
    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      res.status(400).json({ success: false, error: 'Valid task ID is required' });
      return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    if (!task.assignedWorkerId || task.assignedWorkerId.toString() !== workerId) {
      res.status(403).json({
        success: false,
        error: 'Only the assigned worker can mark the task complete',
      });
      return;
    }
    if (task.status !== 'OPEN' && task.status !== 'IN_PROGRESS') {
      res.status(400).json({
        success: false,
        error: 'Task can only be marked complete when assigned or in progress',
      });
      return;
    }

    task.status = 'IN_PROGRESS';
    await task.save();

    const updated = await Task.findById(taskId)
      .populate('posterId', 'firstName lastName email')
      .populate('assignedWorkerId', 'firstName lastName email rating');

    const posterFormatted = formatPopulatedUser(updated!.posterId);
    const assignedWorkerFormatted = updated!.assignedWorkerId
      ? formatPopulatedUser(updated!.assignedWorkerId)
      : undefined;

    res.status(200).json({
      success: true,
      data: {
        task: {
          _id: updated!._id,
          title: updated!.title,
          description: updated!.description,
          pictures: updated!.pictures,
          money: updated!.money,
          location: updated!.location,
          type: updated!.type,
          points: updated!.points,
          status: updated!.status,
          posterId: posterFormatted,
          assignedWorkerId: assignedWorkerFormatted,
          createdAt: updated!.createdAt,
          updatedAt: updated!.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Mark complete by worker error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark task complete',
    });
    return;
  }
};

export const confirmCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req as CustomeRequest;
    const posterId = q.user?._id;
    if (!posterId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const { id: taskId } = req.params;
    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      res.status(400).json({ success: false, error: 'Valid task ID is required' });
      return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    if (task.posterId.toString() !== posterId) {
      res.status(403).json({ success: false, error: 'Only the poster can confirm completion' });
      return;
    }
    if (
      task.status !== 'OPEN' &&
      task.status !== 'IN_PROGRESS'
    ) {
      res.status(400).json({
        success: false,
        error: 'Task can only be completed when assigned, in progress, or pending confirmation',
      });
      return;
    }

    task.status = 'COMPLETED';
    await task.save();

    // Add task points to the assigned worker when poster confirms
    if (task.assignedWorkerId) {
      await User.findByIdAndUpdate(task.assignedWorkerId, {
        $inc: { points: task.points },
      });
    }

    const updated = await Task.findById(taskId)
      .populate('posterId', 'firstName lastName email')
      .populate('assignedWorkerId', 'firstName lastName email rating');

    const posterFormatted = formatPopulatedUser(updated!.posterId);
    const assignedWorkerFormatted = updated!.assignedWorkerId
      ? formatPopulatedUser(updated!.assignedWorkerId)
      : undefined;

    res.status(200).json({
      success: true,
      data: {
        task: {
          _id: updated!._id,
          title: updated!.title,
          description: updated!.description,
          pictures: updated!.pictures,
          money: updated!.money,
          location: updated!.location,
          type: updated!.type,
          points: updated!.points,
          status: updated!.status,
          posterId: posterFormatted,
          assignedWorkerId: assignedWorkerFormatted,
          createdAt: updated!.createdAt,
          updatedAt: updated!.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Confirm completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm completion',
    });
  }
};

export const submitRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req as CustomeRequest;
    const posterId = q.user?._id;
    if (!posterId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const { id: taskId } = req.params;
    let { rating: score } = req.body;

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      res.status(400).json({ success: false, error: 'Valid task ID is required' });
      return;
    }
    const numScore = Number(score);
    if (!Number.isFinite(numScore) || numScore < 1 || numScore > 5) {
      res.status(400).json({ success: false, error: 'Rating must be a number between 1 and 5' });
      return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    if (task.posterId.toString() !== posterId) {
      res.status(403).json({ success: false, error: 'Only the poster can rate the worker' });
      return;
    }
    if (task.status !== 'COMPLETED') {
      res.status(400).json({ success: false, error: 'Task must be completed before rating' });
      return;
    }
    const workerId = task.assignedWorkerId;
    if (!workerId) {
      res.status(400).json({ success: false, error: 'No assigned worker to rate' });
      return;
    }

    const roundedScore = Math.round(numScore);
    await Rating.findOneAndUpdate(
      { taskId },
      {
        taskId: new mongoose.Types.ObjectId(taskId),
        raterId: new mongoose.Types.ObjectId(posterId),
        ratedUserId: workerId,
        score: roundedScore,
      },
      { upsert: true, new: true }
    );

    const [avgResult] = await Rating.aggregate([
      { $match: { ratedUserId: workerId } },
      { $group: { _id: null, avg: { $avg: '$score' } } },
    ]);
    const newRating = avgResult?.avg != null ? Math.round(avgResult.avg * 10) / 10 : null;
    await User.findByIdAndUpdate(workerId, { rating: newRating });

    res.status(200).json({
      success: true,
      data: {
        message: 'Rating submitted',
        rating: roundedScore,
        workerRating: newRating,
      },
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit rating',
    });
  }
};

