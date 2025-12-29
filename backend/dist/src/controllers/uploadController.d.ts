import type { Request, Response } from 'express';
/**
 * Upload files temporarily
 * POST /api/upload/temp
 * Protected: Admin only
 */
export declare const uploadTemp: (req: Request, res: Response) => Promise<void>;
/**
 * Delete a temporarily uploaded file
 * DELETE /api/upload/temp/:filename
 * Protected: Admin only
 */
export declare const deleteTempFile: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=uploadController.d.ts.map