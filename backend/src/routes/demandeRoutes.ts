import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';
import {
    createDemande,
    getAllDemandes,
    getDemandeById,
    updateDemande,
    deleteDemande
} from '../controllers/demandeController';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticateToken, isAdmin);

// POST /api/admin/demandes - Create new demande
router.post('/', createDemande);

// GET /api/admin/demandes - Get all demandes
router.get('/', getAllDemandes);

// GET /api/admin/demandes/:id - Get single demande
router.get('/:id', getDemandeById);

// PUT /api/admin/demandes/:id - Update demande
router.put('/:id', updateDemande);

// DELETE /api/admin/demandes/:id - Delete demande
router.delete('/:id', deleteDemande);

export default router;
