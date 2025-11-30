import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';
import { uploadTempFiles } from '../middleware/tempUploadMiddleware';
import { uploadTemp, deleteTempFile } from '../controllers/uploadController';

const router = express.Router();

// Upload files temporarily
router.post(
    '/temp',
    authenticateToken,
    isAdmin,
    uploadTempFiles, // Multer middleware
    uploadTemp       // Controller
);

// Delete temporary file
router.delete(
    '/temp/:filename',
    authenticateToken,
    isAdmin,
    deleteTempFile
);

export default router;
