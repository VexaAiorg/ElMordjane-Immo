import type { Request, Response } from 'express';
/**
 * Get all collaborateurs with their property counts
 * GET /api/admin/collaborateurs
 * Protected: Admin only
 */
export declare const getAllCollaborateurs: (req: Request, res: Response) => Promise<void>;
/**
 * Get properties created by a specific collaborateur
 * GET /api/admin/collaborateurs/:id/properties
 * Protected: Admin only
 */
export declare const getCollaborateurProperties: (req: Request, res: Response) => Promise<void>;
/**
 * Get a single collaborateur by ID
 * GET /api/admin/collaborateurs/:id
 * Protected: Admin only
 */
export declare const getCollaborateurById: (req: Request, res: Response) => Promise<void>;
/**
 * Update a collaborateur
 * PUT /api/admin/collaborateurs/:id
 * Protected: Admin only
 */
export declare const updateCollaborateur: (req: Request, res: Response) => Promise<void>;
/**
 * Create a new collaborateur
 * POST /api/admin/collaborateurs
 * Protected: Admin only
 */
export declare const createCollaborateur: (req: Request, res: Response) => Promise<void>;
/**
 * Delete a collaborateur
 * DELETE /api/admin/collaborateurs/:id
 * Protected: Admin only
 */
export declare const deleteCollaborateur: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=collaborateurController.d.ts.map