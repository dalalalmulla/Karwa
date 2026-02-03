import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Application from '../models/Application';
import Task from '../models/Task';
import { CustomeRequest } from '../types/http';

// Worker applies to a task
export const applyToTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const customReq = req as CustomeRequest;
        const workerId = customReq.user?._id;

        if (!workerId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }

        const { taskId } = req.body;

        // Validate taskId
        if (!taskId) {
            res.status(400).json({
                success: false,
                error: 'Task ID is required',
            });
            return;
        }

        // Validate taskId format
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid task ID format',
            });
            return;
        }

        // Check if task exists
        const task = await Task.findById(taskId);
        if (!task) {
            res.status(404).json({
                success: false,
                error: 'Task not found',
            });
            return;
        }

        // Check if user is trying to apply to their own task
        if (task.posterId.toString() === workerId) {
            res.status(400).json({
                success: false,
                error: 'You cannot apply to your own task',
            });
            return;
        }

        // Check if task is still open
        if (task.status !== 'OPEN') {
            res.status(400).json({
                success: false,
                error: 'Task is no longer accepting applications',
            });
            return;
        }

        // Check if application already exists (unique constraint will also catch this)
        const existingApplication = await Application.findOne({
            workerId,
            taskId,
        });

        if (existingApplication) {
            res.status(409).json({
                success: false,
                error: 'You have already applied to this task',
            });
            return;
        }

        // Create application
        const application = await Application.create({
            workerId,
            taskId,
            status: 'PENDING',
        });

        // Populate worker info
        await application.populate('workerId', 'firstName lastName email');

        res.status(201).json({
            success: true,
            data: {
                application: {
                    _id: application._id,
                    workerId: {
                        _id: (application.workerId as unknown as { _id: mongoose.Types.ObjectId })._id.toString(),
                        firstName: (application.workerId as unknown as { firstName?: string }).firstName,
                        lastName: (application.workerId as unknown as { lastName?: string }).lastName,
                        email: (application.workerId as unknown as { email: string }).email,
                    },
                    taskId: application.taskId.toString(),
                    status: application.status,
                    createdAt: application.createdAt,
                    updatedAt: application.updatedAt,
                },
            },
        });
    } catch (error) {
        console.error('Apply to task error:', error);

        // Handle duplicate key error (unique constraint violation)
        if ((error as { code?: number }).code === 11000) {
            res.status(409).json({
                success: false,
                error: 'You have already applied to this task',
            });
            return;
        }

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
            error: 'Failed to apply to task. Please try again.',
        });
    }
};

// Poster can see applicants for their task
export const getTaskApplications = async (req: Request, res: Response): Promise<void> => {
    try {
        const customReq = req as CustomeRequest;
        const userId = customReq.user?._id;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }

        const { taskId } = req.params;

        // Validate taskId format
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid task ID format',
            });
            return;
        }

        // Check if task exists and user is the poster
        const task = await Task.findById(taskId);
        if (!task) {
            res.status(404).json({
                success: false,
                error: 'Task not found',
            });
            return;
        }

        if (task.posterId.toString() !== userId) {
            res.status(403).json({
                success: false,
                error: 'You can only view applications for your own tasks',
            });
            return;
        }

        // Get all applications for this task
        const applications = await Application.find({ taskId })
            .populate('workerId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                applications: applications.map((app) => ({
                    _id: app._id,
                    workerId: {
                        _id: (app.workerId as unknown as { _id: mongoose.Types.ObjectId })._id.toString(),
                        firstName: (app.workerId as unknown as { firstName?: string }).firstName,
                        lastName: (app.workerId as unknown as { lastName?: string }).lastName,
                        email: (app.workerId as unknown as { email: string }).email,
                    },
                    taskId: app.taskId.toString(),
                    status: app.status,
                    createdAt: app.createdAt,
                    updatedAt: app.updatedAt,
                })),
            },
        });
    } catch (error) {
        console.error('Get task applications error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications',
        });
    }
};

// Applicant can see tasks they applied to
export const getMyApplications = async (req: Request, res: Response): Promise<void> => {
    try {
        const customReq = req as CustomeRequest;
        const workerId = customReq.user?._id;

        if (!workerId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }

        const { status } = req.query;

        // Build query
        const query: Record<string, unknown> = { workerId };

        // Filter by status if provided
        if (status && ['PENDING', 'ACCEPTED', 'REJECTED'].includes(status as string)) {
            query.status = status;
        }

        // Get applications with task details
        const applications = await Application.find(query)
            .populate('taskId')
            .populate('workerId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                applications: applications.map((app) => {
                    const task = app.taskId as unknown as {
                        _id: mongoose.Types.ObjectId;
                        title: string;
                        description: string;
                        money: number;
                        location: string;
                        type: string;
                        status: string;
                        posterId: mongoose.Types.ObjectId;
                        createdAt: Date;
                        updatedAt: Date;
                    };

                    const worker = app.workerId as unknown as {
                        _id: mongoose.Types.ObjectId;
                        firstName?: string;
                        lastName?: string;
                        email: string;
                    };

                    return {
                        _id: app._id,
                        workerId: {
                            _id: worker._id.toString(),
                            firstName: worker.firstName,
                            lastName: worker.lastName,
                            email: worker.email,
                        },
                        taskId: app.taskId.toString(),
                        task: {
                            _id: task._id.toString(),
                            title: task.title,
                            description: task.description,
                            money: task.money,
                            location: task.location,
                            type: task.type,
                            status: task.status,
                            posterId: task.posterId.toString(),
                            createdAt: task.createdAt,
                            updatedAt: task.updatedAt,
                        },
                        status: app.status,
                        createdAt: app.createdAt,
                        updatedAt: app.updatedAt,
                    };
                }),
            },
        });
    } catch (error) {
        console.error('Get my applications error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to fetch your applications',
        });
    }
};

