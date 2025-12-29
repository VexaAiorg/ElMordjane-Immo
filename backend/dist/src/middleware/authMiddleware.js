"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminOrCollaborateur = exports.isCollaborateur = exports.isAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
/**
 * Middleware to verify JWT token
 * Protects routes that require authentication
 */
const authenticateToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
        if (!token) {
            res.status(401).json({
                status: 'error',
                message: 'Access denied. No token provided.'
            });
            return;
        }
        // Verify token
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(403).json({
                    status: 'error',
                    message: 'Invalid or expired token'
                });
                return;
            }
            // Attach user data to request object
            req.user = decoded;
            next();
        });
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during authentication'
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware to verify admin role
 * Use this after authenticateToken for admin-only routes
 */
const isAdmin = (req, res, next) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') {
            res.status(403).json({
                status: 'error',
                message: 'Access denied. Admin privileges required.'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during authorization'
        });
    }
};
exports.isAdmin = isAdmin;
/**
 * Middleware to verify collaborateur role
 * Use this after authenticateToken for collaborateur-only routes
 */
const isCollaborateur = (req, res, next) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'COLLABORATEUR') {
            res.status(403).json({
                status: 'error',
                message: 'Access denied. Collaborateur privileges required.'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during authorization'
        });
    }
};
exports.isCollaborateur = isCollaborateur;
/**
 * Middleware to verify either admin or collaborateur role
 * Use this after authenticateToken for routes accessible to both roles
 */
const isAdminOrCollaborateur = (req, res, next) => {
    try {
        const user = req.user;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'COLLABORATEUR')) {
            res.status(403).json({
                status: 'error',
                message: 'Access denied. Admin or Collaborateur privileges required.'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during authorization'
        });
    }
};
exports.isAdminOrCollaborateur = isAdminOrCollaborateur;
//# sourceMappingURL=authMiddleware.js.map