import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

/**
 * Create a new property (Bien Immobilier)
 * POST /api/properties
 * Protected: Admin only
 */
export const createProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        // Parse the JSON data from the form-data
        const data = JSON.parse(req.body.data);

        console.log('Creating property:', data.bienImmobilier?.titre);
        console.log('PiecesJointes received:', data.piecesJointes?.length || 0);
        if (data.piecesJointes?.length > 0) {
            console.log('First piece sample:', JSON.stringify(data.piecesJointes[0], null, 2));
        } else {
            console.log('No piecesJointes received or empty array');
        }

        // Access uploaded files from Multer
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const documentFiles = files?.documents || [];
        const photoFiles = files?.photos || [];

        console.log('Files received from Multer:');
        console.log('- Documents:', documentFiles.length, documentFiles.map(f => f.originalname));
        console.log('- Photos:', photoFiles.length, photoFiles.map(f => f.originalname));

        // Base URL for images
        // If APP_BASE_URL is set (e.g. https://api.site.com), use it.
        const baseUrl = process.env.APP_BASE_URL || ''; 
        
        const getFileUrl = (file: Express.Multer.File, type: string) => {
             // Returns: /uploads/TYPE/filename.jpg
             return `${baseUrl}/uploads/${type}/${file.filename}`;
        };

        const propertyType = data.bienImmobilier.type || 'AUTRE';

        // Use Prisma transaction to ensure data integrity
        const result = await prisma.$transaction(async (tx) => {
            // Step 1: Handle Proprietaire (Owner)
            let proprietaireId: number;

            if (data.proprietaire.isNewOwner) {
                // Create new owner
                const newOwner = await tx.proprietaire.create({
                    data: {
                        nom: data.proprietaire.nom,
                        prenom: data.proprietaire.prenom,
                        telephone: data.proprietaire.telephone,
                        email: data.proprietaire.email || null,
                        adresse: data.proprietaire.adresse || null,
                        typeIdentite: data.proprietaire.typeIdentite || null,
                        numIdentite: data.proprietaire.numIdentite || null,
                        qualite: data.proprietaire.qualite || null,
                        prixType: data.proprietaire.prixType || null,
                        prixNature: data.proprietaire.prixNature || null,
                        prixSource: data.proprietaire.prixSource || null,
                        paiementVente: data.proprietaire.paiementVente || null,
                        paiementLocation: data.proprietaire.paiementLocation || null,
                    }
                });
                proprietaireId = newOwner.id;
            } else {
                // Use existing owner
                proprietaireId = data.proprietaire.proprietaireId;

                // Verify owner exists
                const existingOwner = await tx.proprietaire.findUnique({
                    where: { id: proprietaireId }
                });

                if (!existingOwner) {
                    throw new Error(`Owner with ID ${proprietaireId} not found`);
                }
            }

            // Step 2: Create BienImmobilier (Property)
            const property = await tx.bienImmobilier.create({
                data: {
                    titre: data.bienImmobilier.titre,
                    description: data.bienImmobilier.description || null,
                    type: data.bienImmobilier.type,
                    statut: data.bienImmobilier.statut,
                    transaction: data.bienImmobilier.transaction,
                    prixVente: data.bienImmobilier.prixVente || null,
                    prixLocation: data.bienImmobilier.prixLocation || null,
                    adresse: data.bienImmobilier.adresse || null,
                    proprietaireId,
                }
            });

            // Step 3: Create Detail based on property type
            if (propertyType === 'APPARTEMENT' && data.detailAppartement) {
                await tx.detailAppartement.create({
                    data: {
                        bienId: property.id,
                        ...data.detailAppartement
                    }
                });
            } else if (propertyType === 'TERRAIN' && data.detailTerrain) {
                await tx.detailTerrain.create({
                    data: {
                        bienId: property.id,
                        ...data.detailTerrain
                    }
                });
            } else if (propertyType === 'VILLA' && data.detailVilla) {
                await tx.detailVilla.create({
                    data: {
                        bienId: property.id,
                        ...data.detailVilla
                    }
                });
            } else if (propertyType === 'LOCAL' && data.detailLocal) {
                await tx.detailLocal.create({
                    data: {
                        bienId: property.id,
                        ...data.detailLocal
                    }
                });
            } else if (propertyType === 'IMMEUBLE' && data.detailImmeuble) {
                await tx.detailImmeuble.create({
                    data: {
                        bienId: property.id,
                        ...data.detailImmeuble
                    }
                });
            }

            // Step 4: Create Papiers (Documents)
            // Note: Papiers are also uploaded files, we need to find them in the uploaded files
            // Map of filename -> uploaded file
            const uploadedFilesMap = new Map<string, Express.Multer.File>();
            [...photoFiles, ...documentFiles].forEach(f => uploadedFilesMap.set(f.originalname, f));

            if (data.papiers && Array.isArray(data.papiers)) {
                for (let i = 0; i < data.papiers.length; i++) {
                    const papier = data.papiers[i];
                    // Check if this papier corresponds to an uploaded file
                    // The frontend should send the file with the same name
                    // But for Papiers (Checklist), they might not always have a file uploaded right away?
                    // If they do, it's in the uploadedFilesMap
                    
                    // Actually, the frontend sends Page 4 documents as 'piecesJointes' with type DOCUMENT as well
                    // But here we are populating the 'Papier' table which is the checklist.
                    // The actual file link might be stored here OR in PieceJointe?
                    // The schema seems to have 'Papier' as a checklist.
                    // Let's just create the checklist item.
                    
                    await tx.papier.create({
                        data: {
                            bienId: property.id,
                            nom: papier.nom,
                            categorie: papier.categorie || propertyType,
                            statut: papier.statut || 'MANQUANT'
                        }
                    });
                }
            }

            // Step 5: Create PiecesJointes (Attachments)
            // This includes Photos, Documents (from Page 4 & 6), and Locations
            if (data.piecesJointes && Array.isArray(data.piecesJointes)) {
                for (const piece of data.piecesJointes) {
                    const uploadedFile = uploadedFilesMap.get(piece.nom);

                    if (uploadedFile) {
                        // It's a file we just uploaded
                        await tx.pieceJointe.create({
                            data: {
                                bienId: property.id,
                                type: piece.type,
                                visibilite: piece.visibilite || 'INTERNE',
                                url: getFileUrl(uploadedFile, propertyType),
                                nom: piece.nom
                            }
                        });
                    } else if (piece.url) {
                        // It's a URL-only attachment (like Google Maps)
                        await tx.pieceJointe.create({
                            data: {
                                bienId: property.id,
                                type: piece.type,
                                visibilite: piece.visibilite || 'INTERNE',
                                url: piece.url,
                                nom: piece.nom
                            }
                        });
                    }
                }
            }

            // Step 6: Create Suivi (Tracking)
            if (data.suivi) {
                await tx.suivi.create({
                    data: {
                        bienId: property.id,
                        estVisite: data.suivi.estVisite || false,
                        priorite: data.suivi.priorite || 'NORMAL',
                        aMandat: data.suivi.aMandat || false,
                        urlGoogleSheet: data.suivi.urlGoogleSheet || null,
                        urlGooglePhotos: data.suivi.urlGooglePhotos || null
                    }
                });
            }

            // Return the complete property with all relations
            return await tx.bienImmobilier.findUnique({
                where: { id: property.id },
                include: {
                    proprietaire: true,
                    detailAppartement: true,
                    detailTerrain: true,
                    detailVilla: true,
                    detailLocal: true,
                    detailImmeuble: true,
                    papiers: true,
                    piecesJointes: true,
                    suivi: true
                }
            });
        });

        res.status(201).json({
            status: 'success',
            message: 'Property created successfully',
            data: result
        });

    } catch (error: any) {
        console.error('Property creation error:', error);

        // Handle specific errors
        if (error.message?.includes('Owner with ID')) {
            res.status(404).json({
                status: 'error',
                message: error.message
            });
            return;
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to create property',
            error: error.message
        });
    }
};

/**
 * Get all properties
 * GET /api/properties
 * Protected: Admin only
 */
export const getAllProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const properties = await prisma.bienImmobilier.findMany({
            include: {
                proprietaire: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        telephone: true,
                        email: true
                    }
                },
                suivi: true,
                piecesJointes: {
                    where: {
                        type: 'PHOTO',
                        visibilite: 'PUBLIABLE'
                    },
                    take: 1
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
        console.error('Get properties error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch properties'
        });
    }
};

/**
 * Get a single property by ID
 * GET /api/properties/:id
 * Protected: Admin only
 */
export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid property ID'
            });
            return;
        }

        const property = await prisma.bienImmobilier.findUnique({
            where: { id: parseInt(id) },
            include: {
                proprietaire: true,
                detailAppartement: true,
                detailTerrain: true,
                detailVilla: true,
                detailLocal: true,
                detailImmeuble: true,
                papiers: true,
                piecesJointes: true,
                suivi: true,
                visites: true
            }
        });

        if (!property) {
            res.status(404).json({
                status: 'error',
                message: 'Property not found'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: property
        });

    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch property'
        });
    }
};

/**
 * Delete a property by ID
 * DELETE /api/properties/:id
 * Protected: Admin only
 */
export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid property ID'
            });
            return;
        }

        const propertyId = parseInt(id);

        // Check if property exists
        const existingProperty = await prisma.bienImmobilier.findUnique({
            where: { id: propertyId }
        });

        if (!existingProperty) {
            res.status(404).json({
                status: 'error',
                message: 'Property not found'
            });
            return;
        }

        // Delete property
        await prisma.bienImmobilier.delete({
            where: { id: propertyId }
        });

        res.status(200).json({
            status: 'success',
            message: 'Property deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete property error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete property',
            error: error.message
        });
    }
};
