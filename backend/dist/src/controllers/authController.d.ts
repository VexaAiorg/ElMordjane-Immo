import type { Request, Response } from 'express';
/**
 * Admin Signup (One-time only)
 * POST /api/auth/signup
 */
export declare const signup: (req: Request, res: Response) => Promise<void>;
/**
 * Admin Login
 * POST /api/auth/login
 */
export declare const login: (req: Request, res: Response) => Promise<void>;
/**
 * Admin Logout
 * POST /api/auth/logout
 * Note: With JWT, logout is primarily handled client-side by removing the token
 * This endpoint exists for consistency and future token blacklisting if needed
 */
export declare const logout: (req: Request, res: Response) => Promise<void>;
/**
 * Verify Token (Optional - for checking if user is authenticated)
 * GET /api/auth/verify
 */
export declare const verifyToken: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map