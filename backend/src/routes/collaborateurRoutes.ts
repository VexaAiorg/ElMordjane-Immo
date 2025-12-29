import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';
import {
    getAllCollaborateurs,
    getCollaborateurProperties,
    createCollaborateur,
    deleteCollaborateur,
    getCollaborateurById,
    updateCollaborateur
} from '../controllers/collaborateurController.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticateToken, isAdmin);

// GET /api/admin/collaborateurs - Get all collaborateurs
router.get('/', getAllCollaborateurs);

// GET /api/admin/collaborateurs/:id/properties - Get properties created by collaborateur
router.get('/:id/properties', getCollaborateurProperties);

// GET /api/admin/collaborateurs/:id - Get single collaborateur
router.get('/:id', getCollaborateurById);

// PUT /api/admin/collaborateurs/:id - Update collaborateur
router.put('/:id', updateCollaborateur);

// POST /api/admin/collaborateurs - Create new collaborateur
router.post('/', createCollaborateur);

// DELETE /api/admin/collaborateurs/:id - Delete collaborateur
router.delete('/:id', deleteCollaborateur);

export default router;
