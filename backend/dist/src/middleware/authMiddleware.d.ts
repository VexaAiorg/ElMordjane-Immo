import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware to verify JWT token
 * Protects routes that require authentication
 */
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to verify admin role
 * Use this after authenticateToken for admin-only routes
 */
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to verify collaborateur role
 * Use this after authenticateToken for collaborateur-only routes
 */
export declare const isCollaborateur: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to verify either admin or collaborateur role
 * Use this after authenticateToken for routes accessible to both roles
 */
export declare const isAdminOrCollaborateur: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map