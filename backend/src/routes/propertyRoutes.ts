import { Router } from 'express';
import { createProperty, getAllProperties, getPropertyById, deleteProperty, updateProperty } from '../controllers/propertyController.js';
import { authenticateToken, isAdmin, isAdminOrCollaborateur } from '../middleware/authMiddleware.js';

import { uploadPropertyFiles } from '../middleware/uploadMiddleware.js';

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
 * @desc    Get all properties
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
 * @route   DELETE /api/properties/:id
 * @desc    Delete a property by ID
 * @access  Private (Admin only)
 */
router.delete(
    '/:id',
    authenticateToken,
    isAdmin,
    deleteProperty
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
