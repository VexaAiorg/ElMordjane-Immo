import type { Request, Response } from 'express';
/**
 * Get current user profile
 * GET /api/user/profile
 */
export declare const getProfile: (req: Request, res: Response) => Promise<void>;
/**
 * Update user profile
 * PUT /api/user/profile
 */
export declare const updateProfile: (req: Request, res: Response) => Promise<void>;
/**
 * Update password
 * PUT /api/user/password
 */
export declare const updatePassword: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map