import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// POST /api/uploads — Upload one or more images
router.post(
    '/',
    authenticate,
    upload.array('images', 5),
    (req: Request, res: Response) => {
        try {
            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'No files uploaded',
                });
                return;
            }

            // Return the file paths (relative to the static /uploads route)
            const urls = files.map((file) => `/uploads/${file.filename}`);

            res.status(200).json({
                success: true,
                data: { urls },
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to upload files',
            });
        }
    }
);

export default router;

