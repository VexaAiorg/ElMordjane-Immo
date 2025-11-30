import { Router } from 'express';
import { signup, login, logout, verifyToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Create admin account (one-time only)
 * @access  Public (but restricted to first signup only)
 */
router.post('/signup', signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login admin user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout admin user
 * @access  Private
 */
router.post('/logout', authenticateToken, logout);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get('/verify', authenticateToken, verifyToken);

export default router;
