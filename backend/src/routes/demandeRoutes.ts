import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';
import {
    createDemande,
    getAllDemandes
} from '../controllers/demandeController.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticateToken, isAdmin);

// POST /api/admin/demandes - Create new demande
router.post('/', createDemande);

// GET /api/admin/demandes - Get all demandes
router.get('/', getAllDemandes);

export default router;
