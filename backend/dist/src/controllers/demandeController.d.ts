import type { Request, Response } from 'express';
/**
 * Create a new demande (client request)
 * POST /api/admin/demandes
 * Protected: Admin only
 */
export declare const createDemande: (req: Request, res: Response) => Promise<void>;
/**
 * Get all demandes
 * GET /api/admin/demandes
 * Protected: Admin only
 */
export declare const getAllDemandes: (req: Request, res: Response) => Promise<void>;
/**
 * Get a single demande by ID
 * GET /api/admin/demandes/:id
 * Protected: Admin only
 */
export declare const getDemandeById: (req: Request, res: Response) => Promise<void>;
/**
 * Update a demande
 * PUT /api/admin/demandes/:id
 * Protected: Admin only
 */
export declare const updateDemande: (req: Request, res: Response) => Promise<void>;
/**
 * Delete a demande
 * DELETE /api/admin/demandes/:id
 * Protected: Admin only
 */
export declare const deleteDemande: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=demandeController.d.ts.map