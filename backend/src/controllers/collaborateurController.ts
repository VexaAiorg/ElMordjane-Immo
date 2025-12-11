import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

/**
 * Get all collaborateurs with their property counts
 * GET /api/admin/collaborateurs
 * Protected: Admin only
 */
export const getAllCollaborateurs = async (req: Request, res: Response): Promise<void> => {
    try {
        const collaborateurs = await prisma.utilisateur.findMany({
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
    } catch (error) {
        console.error('Error fetching collaborateurs:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching collaborateurs'
        });
    }
};

/**
 * Get properties created by a specific collaborateur
 * GET /api/admin/collaborateurs/:id/properties
 * Protected: Admin only
 */
export const getCollaborateurProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!id) {
            res.status(400).json({
                status: 'error',
                message: 'Collaborateur ID is required'
            });
            return;
        }

        const collaborateurId = parseInt(id as string);

        if (isNaN(collaborateurId)) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid collaborateur ID'
            });
            return;
        }

        // Check if collaborateur exists
        const collaborateur = await prisma.utilisateur.findUnique({
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
        const properties = await prisma.bienImmobilier.findMany({
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
    } catch (error) {
        console.error('Error fetching collaborateur properties:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching properties'
        });
    }
};

/**
 * Get a single collaborateur by ID
 * GET /api/admin/collaborateurs/:id
 * Protected: Admin only
 */
export const getCollaborateurById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const collaborateurId = parseInt(id as string);

        if (isNaN(collaborateurId)) {
            res.status(400).json({ status: 'error', message: 'Invalid collaborateur ID' });
            return;
        }

        const collaborateur = await prisma.utilisateur.findUnique({
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
    } catch (error) {
        console.error('Error fetching collaborateur:', error);
        res.status(500).json({ status: 'error', message: 'Error fetching collaborateur' });
    }
};

/**
 * Update a collaborateur
 * PUT /api/admin/collaborateurs/:id
 * Protected: Admin only
 */
export const updateCollaborateur = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { email, nom, prenom, password } = req.body;
        const collaborateurId = parseInt(id as string);

        if (isNaN(collaborateurId)) {
            res.status(400).json({ status: 'error', message: 'Invalid collaborateur ID' });
            return;
        }

        // Check if exists
        const existingCollab = await prisma.utilisateur.findUnique({
            where: { id: collaborateurId }
        });

        if (!existingCollab) {
            res.status(404).json({ status: 'error', message: 'Collaborateur not found' });
            return;
        }

        // Prepare update data
        const updateData: any = {};
        if (email) updateData.email = email;
        if (nom) updateData.nom = nom;
        if (prenom) updateData.prenom = prenom;
        
        // Handle password update if provided
        if (password && password.trim() !== '') {
            if (password.length < 6) {
                res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters' });
                return;
            }
            const bcrypt = await import('bcrypt');
            updateData.motDePasse = await bcrypt.hash(password as string, 10);
        }

        const updatedCollaborateur = await prisma.utilisateur.update({
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
    } catch (error) {
        console.error('Error updating collaborateur:', error);
        res.status(500).json({ status: 'error', message: 'Error updating collaborateur' });
    }
};

/**
 * Create a new collaborateur
 * POST /api/admin/collaborateurs
 * Protected: Admin only
 */
export const createCollaborateur = async (req: Request, res: Response): Promise<void> => {
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
        const existingUser = await prisma.utilisateur.findUnique({
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
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash(password as string, 10);

        // Create collaborateur
        const collaborateur = await prisma.utilisateur.create({
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
    } catch (error) {
        console.error('Error creating collaborateur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating collaborateur'
        });
    }
};

/**
 * Delete a collaborateur
 * DELETE /api/admin/collaborateurs/:id
 * Protected: Admin only
 */
export const deleteCollaborateur = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!id) {
            res.status(400).json({
                status: 'error',
                message: 'Collaborateur ID is required'
            });
            return;
        }

        const collaborateurId = parseInt(id as string);

        if (isNaN(collaborateurId)) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid collaborateur ID'
            });
            return;
        }

        // Check if collaborateur exists
        const collaborateur = await prisma.utilisateur.findUnique({
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
        await prisma.utilisateur.delete({
            where: { id: collaborateurId }
        });

        res.status(200).json({
            status: 'success',
            message: 'Collaborateur deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting collaborateur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting collaborateur'
        });
    }
};
