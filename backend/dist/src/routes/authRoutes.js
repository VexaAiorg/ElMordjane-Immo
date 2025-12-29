"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/auth/signup
 * @desc    Create admin account (one-time only)
 * @access  Public (but restricted to first signup only)
 */
router.post('/signup', authController_1.signup);
/**
 * @route   POST /api/auth/login
 * @desc    Login admin user
 * @access  Public
 */
router.post('/login', authController_1.login);
/**
 * @route   POST /api/auth/logout
 * @desc    Logout admin user
 * @access  Private
 */
router.post('/logout', authMiddleware_1.authenticateToken, authController_1.logout);
/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get('/verify', authMiddleware_1.authenticateToken, authController_1.verifyToken);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map