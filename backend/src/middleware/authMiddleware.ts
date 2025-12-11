import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

interface JwtPayload {
    id: number;
    email: string;
    role: string;
}

/**
 * Middleware to verify JWT token
 * Protects routes that require authentication
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
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
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(403).json({
                    status: 'error',
                    message: 'Invalid or expired token'
                });
                return;
            }

            // Attach user data to request object
            req.user = decoded as JwtPayload;
            next();
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during authentication'
        });
    }
};

/**
 * Middleware to verify admin role
 * Use this after authenticateToken for admin-only routes
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
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
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during authorization'
        });
    }
};

/**
 * Middleware to verify collaborateur role
 * Use this after authenticateToken for collaborateur-only routes
 */
export const isCollaborateur = (req: Request, res: Response, next: NextFunction): void => {
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
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during authorization'
        });
    }
};

/**
 * Middleware to verify either admin or collaborateur role
 * Use this after authenticateToken for routes accessible to both roles
 */
export const isAdminOrCollaborateur = (req: Request, res: Response, next: NextFunction): void => {
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
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during authorization'
        });
    }
};

