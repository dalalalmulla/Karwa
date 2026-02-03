import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import User from '../models/User';
import { CustomeRequest } from '../types/http';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req as CustomeRequest
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyToken(token); // { userId, email }

    // Optionally fetch user from database to ensure they still exist
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found. Token may be invalid.',
      });
      return;
    }

    // Attach user to request object
    q.user = {
      _id: user._id.toString(),
      email: user.email,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please login again.',
    });
  }
};
