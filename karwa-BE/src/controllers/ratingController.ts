import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Rating from '../models/Rating';
import Task from '../models/Task';
import Application from '../models/Application';
import User from '../models/User';
import { CustomeRequest } from '../types/http';

// Helper function to recalculate user's average rating
const recalculateUserRating = async (userId: string): Promise<void> => {
    const ratings = await Rating.find({ ratedUserId: userId });

    if (ratings.length === 0) {
        await User.findByIdAndUpdate(userId, { rating: 0 });
        return;
    }

    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / ratings.length;

    await User.findByIdAndUpdate(userId, {
        rating: Math.round(average * 10) / 10 // Round to 1 decimal place
    });
};

// Create or update rating
export const createOrUpdateRating = async (req: Request, res: Response): Promise<void> => {
    try {
        const customReq = req as CustomeRequest;
        const raterId = customReq.user?._id;

        if (!raterId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }

        const { taskId, ratedUserId, rating } = req.body;

        // Validate required fields
        if (!taskId || !ratedUserId || !rating) {
            res.status(400).json({
                success: false,
                error: 'Task ID, rated user ID, and rating are required',
            });
            return;
        }

        // Validate rating value
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            res.status(400).json({
                success: false,
                error: 'Rating must be an integer between 1 and 5',
            });
            return;
        }

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(taskId) ||
            !mongoose.Types.ObjectId.isValid(ratedUserId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format',
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

        // Check if rated user exists
        const ratedUser = await User.findById(ratedUserId);
        if (!ratedUser) {
            res.status(404).json({
                success: false,
                error: 'Rated user not found',
            });
            return;
        }

        // Check if rater is trying to rate themselves
        if (raterId === ratedUserId) {
            res.status(400).json({
                success: false,
                error: 'You cannot rate yourself',
            });
            return;
        }

        // Verify user can rate (must be poster or accepted worker)
        const isPoster = task.posterId.toString() === raterId;
        const isRatingPoster = task.posterId.toString() === ratedUserId;

        if (isPoster) {
            // Poster is rating - must be rating a worker
            if (isRatingPoster) {
                res.status(400).json({
                    success: false,
                    error: 'You cannot rate yourself',
                });
                return;
            }

            // Check if worker was accepted for this task
            const application = await Application.findOne({
                taskId,
                workerId: ratedUserId,
                status: 'ACCEPTED',
            });

            if (!application) {
                res.status(403).json({
                    success: false,
                    error: 'You can only rate workers who were accepted for this task',
                });
                return;
            }
        } else {
            // Worker is rating - must be rating the poster
            if (!isRatingPoster) {
                res.status(403).json({
                    success: false,
                    error: 'You can only rate the poster of this task',
                });
                return;
            }

            // Check if worker was accepted for this task
            const application = await Application.findOne({
                taskId,
                workerId: raterId,
                status: 'ACCEPTED',
            });

            if (!application) {
                res.status(403).json({
                    success: false,
                    error: 'You can only rate the poster if you were accepted for this task',
                });
                return;
            }
        }

        // Create or update rating (upsert)
        const ratingDoc = await Rating.findOneAndUpdate(
            { raterId, taskId },
            {
                raterId,
                ratedUserId,
                taskId,
                rating,
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        );

        // Recalculate average rating for the rated user
        await recalculateUserRating(ratedUserId);

        res.status(200).json({
            success: true,
            data: {
                rating: {
                    _id: ratingDoc._id,
                    raterId: ratingDoc.raterId.toString(),
                    ratedUserId: ratingDoc.ratedUserId.toString(),
                    taskId: ratingDoc.taskId.toString(),
                    rating: ratingDoc.rating,
                    createdAt: ratingDoc.createdAt,
                    updatedAt: ratingDoc.updatedAt,
                },
            },
        });
    } catch (error) {
        console.error('Create/update rating error:', error);

        // Handle duplicate key error
        if ((error as { code?: number }).code === 11000) {
            res.status(409).json({
                success: false,
                error: 'You have already rated this user for this task',
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
            error: 'Failed to save rating. Please try again.',
        });
    }
};

// Get rating for a specific task and user
export const getRating = async (req: Request, res: Response): Promise<void> => {
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

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid task ID format',
            });
            return;
        }

        // Get rating where current user is the rater
        const rating = await Rating.findOne({
            raterId: userId,
            taskId,
        });

        if (!rating) {
            res.status(200).json({
                success: true,
                data: {
                    rating: null,
                },
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                rating: {
                    _id: rating._id,
                    raterId: rating.raterId.toString(),
                    ratedUserId: rating.ratedUserId.toString(),
                    taskId: rating.taskId.toString(),
                    rating: rating.rating,
                    createdAt: rating.createdAt,
                    updatedAt: rating.updatedAt,
                },
            },
        });
    } catch (error) {
        console.error('Get rating error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to fetch rating',
        });
    }
};

