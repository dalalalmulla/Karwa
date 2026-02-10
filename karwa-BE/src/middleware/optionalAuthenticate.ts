import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import User from '../models/User';
import { CustomeRequest } from '../types/http';

/**
 * Optional authentication middleware - doesn't fail if no token is provided
 * Attaches user to request if token is valid, but allows request to proceed without token
 */
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req as CustomeRequest;
    const authHeader = req.headers.authorization;

    // If no auth header, proceed without user (public access)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyToken(token);
      
      // Optionally fetch user from database to ensure they still exist
      const user = await User.findById(decoded.userId).select('-password');

      if (user) {
        // Attach user to request object if token is valid
        q.user = {
          _id: user._id.toString(),
          email: user.email,
        };
      }
    } catch (error) {
      // If token is invalid, just proceed without user (don't fail the request)
      console.log('Optional auth: Invalid token, proceeding without authentication');
    }

    next();
  } catch (error) {
    // On any error, proceed without authentication
    console.error('Optional auth error:', error);
    next();
  }
};

