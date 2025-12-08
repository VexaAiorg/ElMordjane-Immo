import express from 'express';
import { getProfile, updateProfile, updatePassword } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadProfilePicture } from '../middleware/userUploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', uploadProfilePicture, updateProfile);
router.put('/password', updatePassword);

export default router;
