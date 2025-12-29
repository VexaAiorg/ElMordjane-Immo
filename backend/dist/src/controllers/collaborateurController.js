"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCollaborateur = exports.createCollaborateur = exports.updateCollaborateur = exports.getCollaborateurById = exports.getCollaborateurProperties = exports.getAllCollaborateurs = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * Get all collaborateurs with their property counts
 * GET /api/admin/collaborateurs
 * Protected: Admin only
 */
const getAllCollaborateurs = async (req, res) => {
    try {
        const collaborateurs = await prisma_1.default.utilisateur.findMany({
            where: {
                role: 'COLLABORATEUR'
            },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                photoProfil: true,
                dateCreation: true,
                _count: {
                    select: {
                        biensCreated: true
                    }
                }
            },
            orderBy: {
                dateCreation: 'desc'
            }
        });
        res.status(200).json({
            status: 'success',
            data: collaborateurs,
            count: collaborateurs.length
        });
    }
    catch (error) {
        console.error('Error fetching collaborateurs:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching collaborateurs'
        });
    }
};
exports.getAllCollaborateurs = getAllCollaborateurs;
/**
 * Get properties created by a specific collaborateur
 * GET /api/admin/collaborateurs/:id/properties
 * Protected: Admin only
 */
const getCollaborateurProperties = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                status: 'error',
                message: 'Collaborateur ID is required'
            });
            return;
        }
        const collaborateurId = parseInt(id);
        if (isNaN(collaborateurId)) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid collaborateur ID'
            });
            return;
        }
        // Check if collaborateur exists
        const collaborateur = await prisma_1.default.utilisateur.findUnique({
            where: { id: collaborateurId }
        });
        if (!collaborateur) {
            res.status(404).json({
                status: 'error',
                message: 'Collaborateur not found'
            });
            return;
        }
        // Get properties created by this collaborateur
        const properties = await prisma_1.default.bienImmobilier.findMany({
            where: {
                createdById: collaborateurId
            },
            include: {
                proprietaire: {
                    select: {
                        nom: true,
                        prenom: true
                    }
                }
            },
            orderBy: {
                dateCreation: 'desc'
            }
        });
        res.status(200).json({
            status: 'success',
            data: properties,
            count: properties.length
        });
    }
    catch (error) {
        console.error('Error fetching collaborateur properties:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching properties'
        });
    }
};
exports.getCollaborateurProperties = getCollaborateurProperties;
/**
 * Get a single collaborateur by ID
 * GET /api/admin/collaborateurs/:id
 * Protected: Admin only
 */
const getCollaborateurById = async (req, res) => {
    try {
        const { id } = req.params;
        const collaborateurId = parseInt(id);
        if (isNaN(collaborateurId)) {
            res.status(400).json({ status: 'error', message: 'Invalid collaborateur ID' });
            return;
        }
        const collaborateur = await prisma_1.default.utilisateur.findUnique({
            where: { id: collaborateurId },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true,
                dateCreation: true,
                _count: {
                    select: { biensCreated: true }
                }
            }
        });
        if (!collaborateur) {
            res.status(404).json({ status: 'error', message: 'Collaborateur not found' });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: collaborateur
        });
    }
    catch (error) {
        console.error('Error fetching collaborateur:', error);
        res.status(500).json({ status: 'error', message: 'Error fetching collaborateur' });
    }
};
exports.getCollaborateurById = getCollaborateurById;
/**
 * Update a collaborateur
 * PUT /api/admin/collaborateurs/:id
 * Protected: Admin only
 */
const updateCollaborateur = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, nom, prenom, password } = req.body;
        const collaborateurId = parseInt(id);
        if (isNaN(collaborateurId)) {
            res.status(400).json({ status: 'error', message: 'Invalid collaborateur ID' });
            return;
        }
        // Check if exists
        const existingCollab = await prisma_1.default.utilisateur.findUnique({
            where: { id: collaborateurId }
        });
        if (!existingCollab) {
            res.status(404).json({ status: 'error', message: 'Collaborateur not found' });
            return;
        }
        // Prepare update data
        const updateData = {};
        if (email)
            updateData.email = email;
        if (nom)
            updateData.nom = nom;
        if (prenom)
            updateData.prenom = prenom;
        // Handle password update if provided
        if (password && password.trim() !== '') {
            if (password.length < 6) {
                res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters' });
                return;
            }
            const bcrypt = await Promise.resolve().then(() => __importStar(require('bcrypt')));
            updateData.motDePasse = await bcrypt.hash(password, 10);
        }
        const updatedCollaborateur = await prisma_1.default.utilisateur.update({
            where: { id: collaborateurId },
            data: updateData,
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true,
                dateCreation: true
            }
        });
        res.status(200).json({
            status: 'success',
            message: 'Collaborateur updated successfully',
            data: updatedCollaborateur
        });
    }
    catch (error) {
        console.error('Error updating collaborateur:', error);
        res.status(500).json({ status: 'error', message: 'Error updating collaborateur' });
    }
};
exports.updateCollaborateur = updateCollaborateur;
/**
 * Create a new collaborateur
 * POST /api/admin/collaborateurs
 * Protected: Admin only
 */
const createCollaborateur = async (req, res) => {
    try {
        const { email, password, nom, prenom } = req.body;
        // Validation
        if (!email || !password || !nom || !prenom) {
            res.status(400).json({
                status: 'error',
                message: 'Email, password, nom, and prenom are required'
            });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({
                status: 'error',
                message: 'Password must be at least 6 characters'
            });
            return;
        }
        // Check if email already exists
        const existingUser = await prisma_1.default.utilisateur.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(409).json({
                status: 'error',
                message: 'Email already exists'
            });
            return;
        }
        // Hash password
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcrypt')));
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create collaborateur
        const collaborateur = await prisma_1.default.utilisateur.create({
            data: {
                email,
                motDePasse: hashedPassword,
                nom,
                prenom,
                role: 'COLLABORATEUR'
            },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true,
                dateCreation: true
            }
        });
        res.status(201).json({
            status: 'success',
            message: 'Collaborateur created successfully',
            data: collaborateur
        });
    }
    catch (error) {
        console.error('Error creating collaborateur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating collaborateur'
        });
    }
};
exports.createCollaborateur = createCollaborateur;
/**
 * Delete a collaborateur
 * DELETE /api/admin/collaborateurs/:id
 * Protected: Admin only
 */
const deleteCollaborateur = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                status: 'error',
                message: 'Collaborateur ID is required'
            });
            return;
        }
        const collaborateurId = parseInt(id);
        if (isNaN(collaborateurId)) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid collaborateur ID'
            });
            return;
        }
        // Check if collaborateur exists
        const collaborateur = await prisma_1.default.utilisateur.findUnique({
            where: { id: collaborateurId }
        });
        if (!collaborateur) {
            res.status(404).json({
                status: 'error',
                message: 'Collaborateur not found'
            });
            return;
        }
        // Check if user is not admin (prevent deleting admin accounts)
        if (collaborateur.role === 'ADMIN') {
            res.status(403).json({
                status: 'error',
                message: 'Cannot delete admin accounts'
            });
            return;
        }
        // Delete collaborateur (properties will keep createdById for history)
        await prisma_1.default.utilisateur.delete({
            where: { id: collaborateurId }
        });
        res.status(200).json({
            status: 'success',
            message: 'Collaborateur deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting collaborateur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting collaborateur'
        });
    }
};
exports.deleteCollaborateur = deleteCollaborateur;
//# sourceMappingURL=collaborateurController.js.map