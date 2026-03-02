"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDemande = exports.updateDemande = exports.getDemandeById = exports.getAllDemandes = exports.createDemande = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * Create a new demande (client request)
 * POST /api/admin/demandes
 * Protected: Admin only
 */
const createDemande = async (req, res) => {
    try {
        const { prenom, nom, description } = req.body;
        // Validation
        if (!prenom || !nom || !description) {
            res.status(400).json({
                status: 'error',
                message: 'Prénom, nom, and description are required'
            });
            return;
        }
        // Create demande with automatic date
        const demande = await prisma_1.default.demande.create({
            data: {
                prenom: prenom.trim(),
                nom: nom.trim(),
                description: description.trim(),
                dateDemande: new Date()
            }
        });
        res.status(201).json({
            status: 'success',
            message: 'Demande créée avec succès',
            data: demande
        });
    }
    catch (error) {
        console.error('Error creating demande:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating demande'
        });
    }
};
exports.createDemande = createDemande;
/**
 * Get all demandes
 * GET /api/admin/demandes
 * Protected: Admin only
 */
const getAllDemandes = async (req, res) => {
    try {
        const demandes = await prisma_1.default.demande.findMany({
            orderBy: {
                dateDemande: 'desc'
            }
        });
        res.status(200).json({
            status: 'success',
            data: demandes,
            count: demandes.length
        });
    }
    catch (error) {
        console.error('Error fetching demandes:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching demandes'
        });
    }
};
exports.getAllDemandes = getAllDemandes;
/**
 * Get a single demande by ID
 * GET /api/admin/demandes/:id
 * Protected: Admin only
 */
const getDemandeById = async (req, res) => {
    try {
        const { id } = req.params;
        const demande = await prisma_1.default.demande.findUnique({
            where: { id: Number(id) }
        });
        if (!demande) {
            res.status(404).json({
                status: 'error',
                message: 'Demande not found'
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: demande
        });
    }
    catch (error) {
        console.error('Error fetching demande:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching demande'
        });
    }
};
exports.getDemandeById = getDemandeById;
/**
 * Update a demande
 * PUT /api/admin/demandes/:id
 * Protected: Admin only
 */
const updateDemande = async (req, res) => {
    try {
        const { id } = req.params;
        const { prenom, nom, description } = req.body;
        // Check if demande exists
        const existingDemande = await prisma_1.default.demande.findUnique({
            where: { id: Number(id) }
        });
        if (!existingDemande) {
            res.status(404).json({
                status: 'error',
                message: 'Demande not found'
            });
            return;
        }
        const updatedDemande = await prisma_1.default.demande.update({
            where: { id: Number(id) },
            data: {
                prenom: prenom ? prenom.trim() : undefined,
                nom: nom ? nom.trim() : undefined,
                description: description ? description.trim() : undefined
            }
        });
        res.status(200).json({
            status: 'success',
            message: 'Demande updated successfully',
            data: updatedDemande
        });
    }
    catch (error) {
        console.error('Error updating demande:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating demande'
        });
    }
};
exports.updateDemande = updateDemande;
/**
 * Delete a demande
 * DELETE /api/admin/demandes/:id
 * Protected: Admin only
 */
const deleteDemande = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if demande exists
        const existingDemande = await prisma_1.default.demande.findUnique({
            where: { id: Number(id) }
        });
        if (!existingDemande) {
            res.status(404).json({
                status: 'error',
                message: 'Demande not found'
            });
            return;
        }
        await prisma_1.default.demande.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({
            status: 'success',
            message: 'Demande deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting demande:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting demande'
        });
    }
};
exports.deleteDemande = deleteDemande;
//# sourceMappingURL=demandeController.js.map