"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.updateProfile = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
/**
 * Get current user profile
 * GET /api/user/profile
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma_1.default.utilisateur.findUnique({
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
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération du profil'
        });
    }
};
exports.getProfile = getProfile;
/**
 * Update user profile
 * PUT /api/user/profile
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nom, prenom, email } = req.body;
        const file = req.file;
        // Base URL for images
        const baseUrl = process.env.APP_BASE_URL || '';
        // Prepare update data
        const updateData = {};
        if (nom !== undefined)
            updateData.nom = nom;
        if (prenom !== undefined)
            updateData.prenom = prenom;
        if (email !== undefined)
            updateData.email = email;
        // Handle file upload
        if (file) {
            updateData.photoProfil = `${baseUrl}/uploads/PROFILES/${file.filename}`;
            // Delete old profile picture if exists
            const currentUser = await prisma_1.default.utilisateur.findUnique({ where: { id: userId } });
            if (currentUser?.photoProfil) {
                const oldPathUrl = currentUser.photoProfil.replace(baseUrl, '');
                if (oldPathUrl.startsWith('/uploads/')) {
                    try {
                        const filePath = path_1.default.join(process.cwd(), oldPathUrl);
                        await promises_1.default.unlink(filePath);
                    }
                    catch (err) {
                        console.warn('Could not delete old profile picture:', err);
                    }
                }
            }
        }
        const updatedUser = await prisma_1.default.utilisateur.update({
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
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la mise à jour du profil'
        });
    }
};
exports.updateProfile = updateProfile;
/**
 * Update password
 * PUT /api/user/password
 */
const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            res.status(400).json({
                status: 'error',
                message: 'L\'ancien et le nouveau mot de passe sont requis'
            });
            return;
        }
        // Get user with password
        const user = await prisma_1.default.utilisateur.findUnique({
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
        const validPassword = await bcrypt_1.default.compare(oldPassword, user.motDePasse);
        if (!validPassword) {
            res.status(401).json({
                status: 'error',
                message: 'Ancien mot de passe incorrect'
            });
            return;
        }
        // Hash new password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(newPassword, salt);
        // Update password
        await prisma_1.default.utilisateur.update({
            where: { id: userId },
            data: { motDePasse: hashedPassword }
        });
        res.status(200).json({
            status: 'success',
            message: 'Mot de passe modifié avec succès'
        });
    }
    catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la modification du mot de passe'
        });
    }
};
exports.updatePassword = updatePassword;
//# sourceMappingURL=userController.js.map