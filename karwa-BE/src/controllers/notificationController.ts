import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import { CustomeRequest } from '../types/http';

// Get all notifications for the current user
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req as CustomeRequest;
    const userId = q.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const { read, limit = 50 } = req.query;

    // Build query
    const query: Record<string, unknown> = { userId };

    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.find(query)
      .populate('taskId', 'title status')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({
      success: true,
      data: {
        notifications: notifications.map((n) => ({
          _id: n._id,
          type: n.type,
          title: n.title,
          message: n.message,
          taskId: n.taskId,
          read: n.read,
          createdAt: n.createdAt,
        })),
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
};

// Mark a single notification as read
export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req as CustomeRequest;
    const userId = q.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Valid notification ID is required',
      });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        notification: {
          _id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          taskId: notification.taskId,
          read: notification.read,
          createdAt: notification.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification',
    });
  }
};

// Mark all notifications as read for the current user
export const markAllNotificationsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req as CustomeRequest;
    const userId = q.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    await Notification.updateMany({ userId, read: false }, { read: true });

    res.status(200).json({
      success: true,
      data: {
        message: 'All notifications marked as read',
      },
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notifications',
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req as CustomeRequest;
    const userId = q.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count',
    });
  }
};

// Helper function to create a notification (used by other controllers)
export const createNotification = async (params: {
  userId: string;
  type: 'TASK_STATUS_CHANGED' | 'APPLICATION_UPDATE' | 'TASK_ASSIGNED' | 'TASK_COMPLETED';
  title: string;
  message: string;
  taskId?: string;
}): Promise<void> => {
  try {
    await Notification.create({
      userId: new mongoose.Types.ObjectId(params.userId),
      type: params.type,
      title: params.title,
      message: params.message,
      taskId: params.taskId ? new mongoose.Types.ObjectId(params.taskId) : undefined,
    });
  } catch (error) {
    console.error('Create notification error:', error);
  }
};
