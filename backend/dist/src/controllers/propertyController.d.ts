import type { Request, Response } from 'express';
/**
 * Create a new property (Bien Immobilier)
 * POST /api/properties
 * Protected: Admin only
 */
export declare const createProperty: (req: Request, res: Response) => Promise<void>;
/**
 * Get all properties
 * GET /api/properties
 * Protected: Admin & Collaborateur
 * Note: Collaborateurs cannot view archived properties
 */
export declare const getAllProperties: (req: Request, res: Response) => Promise<void>;
/**
 * Get a single property by ID
 * GET /api/properties/:id
 * Protected: Admin & Collaborateur
 * Note: Collaborateurs cannot view archived properties
 */
export declare const getPropertyById: (req: Request, res: Response) => Promise<void>;
/**
 * Soft delete a property by ID (Move to trash)
 * DELETE /api/properties/:id
 * Protected: Admin only
 * Note: This sets deletedAt timestamp, property will be permanently deleted after 30 days
 */
export declare const deleteProperty: (req: Request, res: Response) => Promise<void>;
/**
 * Update a property by ID
 * PUT /api/properties/:id
 * Protected: Admin & Collaborateur
 * Note: Collaborateurs cannot change archive status
 */
export declare const updateProperty: (req: Request, res: Response) => Promise<void>;
/**
 * Get all trashed properties (deletedAt is not null)
 * GET /api/properties/trash
 * Protected: Admin only
 */
export declare const getTrashedProperties: (req: Request, res: Response) => Promise<void>;
/**
 * Restore a property from trash
 * PUT /api/properties/:id/restore
 * Protected: Admin only
 */
export declare const restoreProperty: (req: Request, res: Response) => Promise<void>;
/**
 * Permanently delete a property by ID
 * DELETE /api/properties/:id/permanent
 * Protected: Admin only
 * Note: This permanently deletes the property and all associated files
 */
export declare const permanentlyDeleteProperty: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=propertyController.d.ts.map