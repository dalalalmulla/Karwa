import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
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

    (req as Request & { user?: { userId: string; email: string } }).user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please login again.',
    });
  }
};
