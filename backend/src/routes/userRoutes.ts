import express from 'express';
import { getProfile, updateProfile, updatePassword } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { uploadProfilePicture } from '../middleware/userUploadMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', uploadProfilePicture, updateProfile);
router.put('/password', updatePassword);

export default router;
