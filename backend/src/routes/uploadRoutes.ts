import express from 'express';
import { authenticateToken, isAdminOrCollaborateur } from '../middleware/authMiddleware';
import { uploadTempFiles } from '../middleware/tempUploadMiddleware';
import { uploadTemp, deleteTempFile } from '../controllers/uploadController';

const router = express.Router();

// Upload files temporarily (Admins and Collaborateurs can upload)
router.post(
    '/temp',
    authenticateToken,
    isAdminOrCollaborateur,
    uploadTempFiles, // Multer middleware
    uploadTemp       // Controller
);

// Delete temporary file (Admins and Collaborateurs can delete)
router.delete(
    '/temp/:filename',
    authenticateToken,
    isAdminOrCollaborateur,
    deleteTempFile
);

export default router;
