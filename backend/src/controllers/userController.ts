import type { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';

/**
 * Get current user profile
 * GET /api/user/profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        const user = await prisma.utilisateur.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                photoProfil: true,
                role: true,
                dateCreation: true
            }
        });

        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'Utilisateur non trouvé'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération du profil'
        });
    }
};

/**
 * Update user profile
 * PUT /api/user/profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { nom, prenom, email } = req.body;
        const file = req.file;

        // Base URL for images
        const baseUrl = process.env.APP_BASE_URL || '';

        // Prepare update data
        const updateData: any = {};
        if (nom !== undefined) updateData.nom = nom;
        if (prenom !== undefined) updateData.prenom = prenom;
        if (email !== undefined) updateData.email = email;

        // Handle file upload
        if (file) {
            updateData.photoProfil = `${baseUrl}/uploads/PROFILES/${file.filename}`;

            // Delete old profile picture if exists
            const currentUser = await prisma.utilisateur.findUnique({ where: { id: userId } });
            if (currentUser?.photoProfil) {
                const oldPathUrl = currentUser.photoProfil.replace(baseUrl, '');
                if (oldPathUrl.startsWith('/uploads/')) {
                    try {
                        const filePath = path.join(process.cwd(), oldPathUrl);
                        await fs.unlink(filePath);
                    } catch (err) {
                        console.warn('Could not delete old profile picture:', err);
                    }
                }
            }
        }

        const updatedUser = await prisma.utilisateur.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                photoProfil: true,
                role: true
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Profil mis à jour avec succès',
            data: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la mise à jour du profil'
        });
    }
};

/**
 * Update password
 * PUT /api/user/password
 */
export const updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            res.status(400).json({
                status: 'error',
                message: 'L\'ancien et le nouveau mot de passe sont requis'
            });
            return;
        }

        // Get user with password
        const user = await prisma.utilisateur.findUnique({
            where: { id: userId }
        });

        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'Utilisateur non trouvé'
            });
            return;
        }

        // Verify old password
        const validPassword = await bcrypt.compare(oldPassword, user.motDePasse);
        if (!validPassword) {
            res.status(401).json({
                status: 'error',
                message: 'Ancien mot de passe incorrect'
            });
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await prisma.utilisateur.update({
            where: { id: userId },
            data: { motDePasse: hashedPassword }
        });

        res.status(200).json({
            status: 'success',
            message: 'Mot de passe modifié avec succès'
        });

    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la modification du mot de passe'
        });
    }
};
