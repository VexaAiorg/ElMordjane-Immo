"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertyController_1 = require("../controllers/propertyController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/properties
 * @desc    Create a new property
 * @access  Private (Admin & Collaborateur)
 * @body    Multipart/form-data
 *          - data: JSON string of property information
 *          - documents: Array of document files
 *          - photos: Array of photo files
 */
router.post('/', authMiddleware_1.authenticateToken, authMiddleware_1.isAdminOrCollaborateur, uploadMiddleware_1.uploadPropertyFiles, propertyController_1.createProperty);
/**
 * @route   GET /api/properties
 * @desc    Get all properties (excluding trashed)
 * @access  Private (Admin & Collaborateur)
 * @note    Collaborateurs cannot view archived properties
 */
router.get('/', authMiddleware_1.authenticateToken, authMiddleware_1.isAdminOrCollaborateur, propertyController_1.getAllProperties);
/**
 * @route   GET /api/properties/trash
 * @desc    Get all trashed properties
 * @access  Private (Admin only)
 */
router.get('/trash', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, propertyController_1.getTrashedProperties);
/**
 * @route   GET /api/properties/:id
 * @desc    Get a single property by ID
 * @access  Private (Admin & Collaborateur)
 * @note    Collaborateurs cannot view archived properties
 */
router.get('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.isAdminOrCollaborateur, propertyController_1.getPropertyById);
/**
 * @route   PUT /api/properties/:id/restore
 * @desc    Restore a property from trash
 * @access  Private (Admin only)
 */
router.put('/:id/restore', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, propertyController_1.restoreProperty);
/**
 * @route   DELETE /api/properties/:id
 * @desc    Soft delete a property (move to trash)
 * @access  Private (Admin only)
 */
router.delete('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, propertyController_1.deleteProperty);
/**
 * @route   DELETE /api/properties/:id/permanent
 * @desc    Permanently delete a property
 * @access  Private (Admin only)
 */
router.delete('/:id/permanent', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, propertyController_1.permanentlyDeleteProperty);
/**
 * @route   PUT /api/properties/:id
 * @desc    Update a property by ID
 * @access  Private (Admin & Collaborateur)
 * @note    Collaborateurs cannot change archive status
 */
router.put('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.isAdminOrCollaborateur, uploadMiddleware_1.uploadPropertyFiles, propertyController_1.updateProperty);
exports.default = router;
//# sourceMappingURL=propertyRoutes.js.map