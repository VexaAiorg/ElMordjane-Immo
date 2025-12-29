import { Router } from 'express';
import {
    createProperty,
    getAllProperties,
    getPropertyById,
    deleteProperty,
    updateProperty,
    getTrashedProperties,
    restoreProperty,
    permanentlyDeleteProperty
} from '../controllers/propertyController';
import { authenticateToken, isAdmin, isAdminOrCollaborateur } from '../middleware/authMiddleware';

import { uploadPropertyFiles } from '../middleware/uploadMiddleware';

const router = Router();

/**
 * @route   POST /api/properties
 * @desc    Create a new property
 * @access  Private (Admin & Collaborateur)
 * @body    Multipart/form-data
 *          - data: JSON string of property information
 *          - documents: Array of document files
 *          - photos: Array of photo files
 */
router.post(
    '/',
    authenticateToken,
    isAdminOrCollaborateur,
    uploadPropertyFiles,
    createProperty
);

/**
 * @route   GET /api/properties
 * @desc    Get all properties (excluding trashed)
 * @access  Private (Admin & Collaborateur)
 * @note    Collaborateurs cannot view archived properties
 */
router.get(
    '/',
    authenticateToken,
    isAdminOrCollaborateur,
    getAllProperties
);

/**
 * @route   GET /api/properties/trash
 * @desc    Get all trashed properties
 * @access  Private (Admin only)
 */
router.get(
    '/trash',
    authenticateToken,
    isAdmin,
    getTrashedProperties
);

/**
 * @route   GET /api/properties/:id
 * @desc    Get a single property by ID
 * @access  Private (Admin & Collaborateur)
 * @note    Collaborateurs cannot view archived properties
 */
router.get(
    '/:id',
    authenticateToken,
    isAdminOrCollaborateur,
    getPropertyById
);

/**
 * @route   PUT /api/properties/:id/restore
 * @desc    Restore a property from trash
 * @access  Private (Admin only)
 */
router.put(
    '/:id/restore',
    authenticateToken,
    isAdmin,
    restoreProperty
);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Soft delete a property (move to trash)
 * @access  Private (Admin only)
 */
router.delete(
    '/:id',
    authenticateToken,
    isAdmin,
    deleteProperty
);

/**
 * @route   DELETE /api/properties/:id/permanent
 * @desc    Permanently delete a property
 * @access  Private (Admin only)
 */
router.delete(
    '/:id/permanent',
    authenticateToken,
    isAdmin,
    permanentlyDeleteProperty
);

/**
 * @route   PUT /api/properties/:id
 * @desc    Update a property by ID
 * @access  Private (Admin & Collaborateur)
 * @note    Collaborateurs cannot change archive status
 */
router.put(
    '/:id',
    authenticateToken,
    isAdminOrCollaborateur,
    uploadPropertyFiles,
    updateProperty
);

export default router;
