import type { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Create a new demande (client request)
 * POST /api/admin/demandes
 * Protected: Admin only
 */
export const createDemande = async (req: Request, res: Response): Promise<void> => {
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
        const demande = await prisma.demande.create({
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
    } catch (error) {
        console.error('Error creating demande:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating demande'
        });
    }
};

/**
 * Get all demandes
 * GET /api/admin/demandes
 * Protected: Admin only
 */
export const getAllDemandes = async (req: Request, res: Response): Promise<void> => {
    try {
        const demandes = await prisma.demande.findMany({
            orderBy: {
                dateDemande: 'desc'
            }
        });

        res.status(200).json({
            status: 'success',
            data: demandes,
            count: demandes.length
        });
    } catch (error) {
        console.error('Error fetching demandes:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching demandes'
        });
    }
};

/**
 * Get a single demande by ID
 * GET /api/admin/demandes/:id
 * Protected: Admin only
 */
export const getDemandeById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const demande = await prisma.demande.findUnique({
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
    } catch (error) {
        console.error('Error fetching demande:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching demande'
        });
    }
};

/**
 * Update a demande
 * PUT /api/admin/demandes/:id
 * Protected: Admin only
 */
export const updateDemande = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { prenom, nom, description } = req.body;

        // Check if demande exists
        const existingDemande = await prisma.demande.findUnique({
            where: { id: Number(id) }
        });

        if (!existingDemande) {
            res.status(404).json({
                status: 'error',
                message: 'Demande not found'
            });
            return;
        }

        const updatedDemande = await prisma.demande.update({
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
    } catch (error) {
        console.error('Error updating demande:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating demande'
        });
    }
};

/**
 * Delete a demande
 * DELETE /api/admin/demandes/:id
 * Protected: Admin only
 */
export const deleteDemande = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if demande exists
        const existingDemande = await prisma.demande.findUnique({
            where: { id: Number(id) }
        });

        if (!existingDemande) {
            res.status(404).json({
                status: 'error',
                message: 'Demande not found'
            });
            return;
        }

        await prisma.demande.delete({
            where: { id: Number(id) }
        });

        res.status(200).json({
            status: 'success',
            message: 'Demande deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting demande:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting demande'
        });
    }
};
