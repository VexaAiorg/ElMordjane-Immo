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
