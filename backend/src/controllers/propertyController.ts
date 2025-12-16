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
                    prixVente: data.bienImmobilier.prixVente ? parseFloat(data.bienImmobilier.prixVente.toString()) : null,
                    prixLocation: data.bienImmobilier.prixLocation ? parseFloat(data.bienImmobilier.prixLocation.toString()) : null,
                    adresse: data.bienImmobilier.adresse || null,
                    proprietaireId,
                    createdById: req.user?.id ?? null, // Track who created this property
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
                                nom: piece.nom,
                                categorie: piece.categorie || null // Link to juridical document type
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
                                nom: piece.nom,
                                categorie: piece.categorie || null
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
 * Protected: Admin & Collaborateur
 * Note: Collaborateurs cannot view archived properties
 */
//
export const getAllProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get user from authenticated request
        const user = (req as any).user;
        const isAdmin = user?.role === 'ADMIN';

        // Build where clause based on user role
        const whereClause: any = {
            deletedAt: null // Exclude trashed properties
        };
        
        // Collaborateurs cannot view archived properties
        if (!isAdmin) {
            whereClause.archive = false;
        }

        const properties = await prisma.bienImmobilier.findMany({
            where: whereClause,
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
                },
                detailAppartement: true,
                detailVilla: true,
                detailTerrain: true,
                detailLocal: true,
                detailImmeuble: true
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
 * Protected: Admin & Collaborateur
 * Note: Collaborateurs cannot view archived properties
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

        // Get user from authenticated request
        const user = (req as any).user;
        const isAdmin = user?.role === 'ADMIN';

        const property = await prisma.bienImmobilier.findUnique({
            where: { id: parseInt(id) },
            include: {
                proprietaire: true,
                createdBy: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true
                    }
                },
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

        // Collaborateurs cannot access archived properties
        if (!isAdmin && property.archive) {
            res.status(403).json({
                status: 'error',
                message: 'Access denied. You do not have permission to view archived properties.'
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
 * Soft delete a property by ID (Move to trash)
 * DELETE /api/properties/:id
 * Protected: Admin only
 * Note: This sets deletedAt timestamp, property will be permanently deleted after 30 days
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

        // Soft delete: Set deletedAt timestamp
        await prisma.bienImmobilier.update({
            where: { id: propertyId },
            data: {
                deletedAt: new Date()
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Property moved to trash. It will be permanently deleted after 30 days.'
        });
    } catch (error: any) {
        console.error('Soft delete property error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete property',
            error: error.message
        });
    }
};

/**
 * Update a property by ID
 * PUT /api/properties/:id
 * Protected: Admin & Collaborateur
 * Note: Collaborateurs cannot change archive status
 */
export const updateProperty = async (req: Request, res: Response): Promise<void> => {
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

        // Parse the JSON data from the form-data
        const data = JSON.parse(req.body.data);

        console.log('Updating property:', propertyId, data.bienImmobilier?.titre);

        // Get user from authenticated request
        const user = (req as any).user;
        const isAdmin = user?.role === 'ADMIN';

        // Prevent collaborateurs from modifying archive status
        if (!isAdmin && data.bienImmobilier?.archive !== undefined) {
            // Get current property to check if archive status is being changed
            const currentProperty = await prisma.bienImmobilier.findUnique({
                where: { id: propertyId },
                select: { archive: true }
            });

            if (currentProperty && currentProperty.archive !== data.bienImmobilier.archive) {
                res.status(403).json({
                    status: 'error',
                    message: 'Access denied. Only admins can change the archive status of properties.'
                });
                return;
            }
        }

        // Access uploaded files from Multer
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const documentFiles = files?.documents || [];
        const photoFiles = files?.photos || [];

        // Base URL for images
        const baseUrl = process.env.APP_BASE_URL || '';
        
        const getFileUrl = (file: Express.Multer.File, type: string) => {
             return `${baseUrl}/uploads/${type}/${file.filename}`;
        };

        const propertyType = data.bienImmobilier.type || 'AUTRE';

        // Use Prisma transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Property Basic Info
            // Build update data object based on role
            const updateData: any = {
                titre: data.bienImmobilier.titre,
                description: data.bienImmobilier.description || null,
                type: data.bienImmobilier.type,
                statut: data.bienImmobilier.statut,
                transaction: data.bienImmobilier.transaction,
                prixVente: data.bienImmobilier.prixVente ? parseFloat(data.bienImmobilier.prixVente.toString()) : null,
                prixLocation: data.bienImmobilier.prixLocation ? parseFloat(data.bienImmobilier.prixLocation.toString()) : null,
                adresse: data.bienImmobilier.adresse || null,
            };

            // Only admins can update archive status
            if (isAdmin && data.bienImmobilier.archive !== undefined) {
                updateData.archive = data.bienImmobilier.archive;
            }

            const property = await tx.bienImmobilier.update({
                where: { id: propertyId },
                data: updateData
            });

            // 2. Update Owner
            if (data.proprietaire) {
                // If it's an existing owner update
                if (data.proprietaire.id) {
                     await tx.proprietaire.update({
                        where: { id: data.proprietaire.id },
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
                }
            }

            // 3. Update Details
            const parseNum = (val: any) => (val !== undefined && val !== null && val !== '') ? parseFloat(val.toString()) : null;
            const parseIntNum = (val: any) => (val !== undefined && val !== null && val !== '') ? parseInt(val.toString()) : null;
            
            // Helper function to remove null/undefined values from update object
            const cleanUpdateData = (obj: any) => {
                const cleaned: any = {};
                for (const key in obj) {
                    if (obj[key] !== null && obj[key] !== undefined) {
                        cleaned[key] = obj[key];
                    }
                }
                return cleaned;
            };

            if (propertyType === 'APPARTEMENT' && data.detailAppartement) {
                const { id, bienId, ...rawDetail } = data.detailAppartement;
                const detailData = {
                    ...rawDetail,
                    surfaceTotal: parseNum(rawDetail.surfaceTotal),
                    surfaceSalon: parseNum(rawDetail.surfaceSalon),
                    surfaceChambre: parseNum(rawDetail.surfaceChambre),
                    surfaceCuisine: parseNum(rawDetail.surfaceCuisine),
                    surfaceSDB: parseNum(rawDetail.surfaceSDB),
                    etage: parseIntNum(rawDetail.etage),
                    anneeConstruction: parseIntNum(rawDetail.anneeConstruction),
                };
                
                // Remove null values to prevent overwriting existing data
                const updateData = cleanUpdateData(detailData);
                
                await tx.detailAppartement.upsert({
                    where: { bienId: propertyId },
                    create: { bienId: propertyId, ...detailData },
                    update: updateData
                });
            } else if (propertyType === 'TERRAIN' && data.detailTerrain) {
                const { id, bienId, ...rawDetail } = data.detailTerrain;
                const surface = parseNum(rawDetail.surface);
                const detailData = {
                    ...rawDetail,
                    surface,
                    longueur: parseNum(rawDetail.longueur),
                    largeur: parseNum(rawDetail.largeur),
                    facades: parseIntNum(rawDetail.facades),
                };
                
                const updateData = cleanUpdateData(detailData);
                
                if (surface !== null) {
                    await tx.detailTerrain.upsert({
                        where: { bienId: propertyId },
                        create: { bienId: propertyId, ...detailData },
                        update: updateData
                    });
                } else {
                    // If surface is missing, try update only
                    try {
                        await tx.detailTerrain.update({
                            where: { bienId: propertyId },
                            data: updateData
                        });
                    } catch (e) { /* Ignore if record doesn't exist */ }
                }
            } else if (propertyType === 'VILLA' && data.detailVilla) {
                const { id, bienId, ...rawDetail } = data.detailVilla;
                const surface = parseNum(rawDetail.surface);
                const detailData = {
                    ...rawDetail,
                    surface,
                    longueur: parseNum(rawDetail.longueur),
                    largeur: parseNum(rawDetail.largeur),
                    facades: parseIntNum(rawDetail.facades),
                    surfaceBatie: parseNum(rawDetail.surfaceBatie),
                    etages: parseIntNum(rawDetail.etages),
                    pieces: parseIntNum(rawDetail.pieces),
                };
                
                const updateData = cleanUpdateData(detailData);

                if (surface !== null) {
                    await tx.detailVilla.upsert({
                        where: { bienId: propertyId },
                        create: { bienId: propertyId, ...detailData },
                        update: updateData
                    });
                } else {
                    try {
                        await tx.detailVilla.update({
                            where: { bienId: propertyId },
                            data: updateData
                        });
                    } catch (e) { /* Ignore */ }
                }
            } else if (propertyType === 'LOCAL' && data.detailLocal) {
                const { id, bienId, ...rawDetail } = data.detailLocal;
                const surface = parseNum(rawDetail.surface);
                const detailData = {
                    ...rawDetail,
                    surface,
                    hauteur: parseNum(rawDetail.hauteur),
                    facades: parseIntNum(rawDetail.facades),
                };
                
                const updateData = cleanUpdateData(detailData);

                if (surface !== null) {
                    await tx.detailLocal.upsert({
                        where: { bienId: propertyId },
                        create: { bienId: propertyId, ...detailData },
                        update: updateData
                    });
                } else {
                    try {
                        await tx.detailLocal.update({
                            where: { bienId: propertyId },
                            data: updateData
                        });
                    } catch (e) { /* Ignore */ }
                }
            } else if (propertyType === 'IMMEUBLE' && data.detailImmeuble) {
                const { id, bienId, ...rawDetail } = data.detailImmeuble;
                const surface = parseNum(rawDetail.surface);
                const detailData = {
                    ...rawDetail,
                    surface,
                    longueur: parseNum(rawDetail.longueur),
                    largeur: parseNum(rawDetail.largeur),
                    facades: parseIntNum(rawDetail.facades),
                    surfaceBatie: parseNum(rawDetail.surfaceBatie),
                    etages: parseIntNum(rawDetail.etages),
                    pieces: parseIntNum(rawDetail.pieces),
                    nbAppartements: parseIntNum(rawDetail.nbAppartements),
                    surfaceSol: parseNum(rawDetail.surfaceSol),
                };
                
                const updateData = cleanUpdateData(detailData);

                if (surface !== null) {
                    await tx.detailImmeuble.upsert({
                        where: { bienId: propertyId },
                        create: { bienId: propertyId, ...detailData },
                        update: updateData
                    });
                } else {
                    try {
                        await tx.detailImmeuble.update({
                            where: { bienId: propertyId },
                            data: updateData
                        });
                    } catch (e) { /* Ignore */ }
                }
            }

            // 3.5 Handle Papiers (Juridical Documents) - Create, Update, Delete
            if (data.papiers && Array.isArray(data.papiers)) {
                // Get IDs of papiers that should remain
                const papiersToKeepIds = data.papiers
                    .filter((p: any) => p.id && !p.id.toString().startsWith('temp-'))
                    .map((p: any) => p.id);

                // Delete removed papiers
                await tx.papier.deleteMany({
                    where: {
                        bienId: propertyId,
                        id: { notIn: papiersToKeepIds }
                    }
                });

                // Upsert papiers (Update existing or Create new)
                for (const papier of data.papiers) {
                    if (papier.id && !papier.id.toString().startsWith('temp-')) {
                        // Update existing
                        await tx.papier.update({
                            where: { id: papier.id },
                            data: {
                                nom: papier.nom,
                                statut: papier.statut,
                                categorie: papier.categorie || propertyType
                            }
                        });
                    } else {
                        // Create new
                        await tx.papier.create({
                            data: {
                                bienId: propertyId,
                                nom: papier.nom,
                                statut: papier.statut,
                                categorie: papier.categorie || propertyType
                            }
                        });
                    }
                }
            }

            // 3.6 Handle File Deletion (Physical and Database)
            if (data.filesToDelete && Array.isArray(data.filesToDelete) && data.filesToDelete.length > 0) {
                console.log('Processing files to delete:', data.filesToDelete);
                const fs = await import('fs/promises');
                const path = await import('path');

                for (const rawFileId of data.filesToDelete) {
                    const fileId = parseInt(rawFileId.toString());
                    if (isNaN(fileId)) {
                        console.warn(`Invalid file ID for deletion: ${rawFileId}`);
                        continue;
                    }

                    const file = await tx.pieceJointe.findUnique({ where: { id: fileId } });
                    
                    if (file) {
                        console.log(`Deleting file ID ${fileId}: ${file.nom} (${file.url})`);
                        // Delete physical file if it exists and is local
                        if (file.url && file.url.startsWith('/uploads/')) {
                            try {
                                const filePath = path.join(process.cwd(), file.url);
                                await fs.unlink(filePath).catch(() => console.log(`File not found on disk: ${filePath}`));
                            } catch (err) {
                                console.error(`Error deleting file ${file.url}:`, err);
                            }
                        }
                        // Delete database record
                        await tx.pieceJointe.delete({ where: { id: fileId } });
                    } else {
                        console.warn(`File ID ${fileId} not found in database.`);
                    }
                }
            }

            // 4. Handle Attachments (Add new ones and update visibility)
            const uploadedFilesMap = new Map<string, Express.Multer.File>();
            [...photoFiles, ...documentFiles].forEach(f => uploadedFilesMap.set(f.originalname, f));

            if (data.piecesJointes && Array.isArray(data.piecesJointes)) {
                for (const piece of data.piecesJointes) {
                    const uploadedFile = uploadedFilesMap.get(piece.nom);

                    if (uploadedFile) {
                        // It's a NEW file we just uploaded
                        await tx.pieceJointe.create({
                            data: {
                                bienId: property.id,
                                type: piece.type,
                                visibilite: piece.visibilite || 'INTERNE',
                                url: getFileUrl(uploadedFile, propertyType),
                                nom: piece.nom,
                                categorie: piece.categorie || null
                            }
                        });
                    } 
                    // If it's an existing file (has ID), update visibility and category
                    else if (piece.id) {
                         await tx.pieceJointe.update({
                            where: { id: piece.id },
                            data: { 
                                visibilite: piece.visibilite,
                                categorie: piece.categorie || null
                            }
                        });
                    }
                }
            }

            // 5. Update Suivi
            if (data.suivi) {
                const { id, bienId, ...suiviData } = data.suivi;
                await tx.suivi.upsert({
                    where: { bienId: propertyId },
                    create: { bienId: propertyId, ...suiviData },
                    update: suiviData
                });
            }

            // Return the updated property
            return await tx.bienImmobilier.findUnique({
                where: { id: propertyId },
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

        res.status(200).json({
            status: 'success',
            message: 'Property updated successfully',
            data: result
        });

    } catch (error: any) {
        console.error('Property update error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update property',
            error: error.message
        });
    }
};

/**
 * Get all trashed properties (deletedAt is not null)
 * GET /api/properties/trash
 * Protected: Admin only
 */
export const getTrashedProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const properties = await prisma.bienImmobilier.findMany({
            where: {
                deletedAt: {
                    not: null
                }
            },
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
                },
                detailAppartement: true,
                detailVilla: true,
                detailTerrain: true,
                detailLocal: true,
                detailImmeuble: true
            },
            orderBy: {
                deletedAt: 'desc'
            }
        });

        res.status(200).json({
            status: 'success',
            data: properties,
            count: properties.length
        });
    } catch (error) {
        console.error('Get trashed properties error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch trashed properties'
        });
    }
};

/**
 * Restore a property from trash
 * PUT /api/properties/:id/restore
 * Protected: Admin only
 */
export const restoreProperty = async (req: Request, res: Response): Promise<void> => {
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

        // Check if property exists and is in trash
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

        if (!existingProperty.deletedAt) {
            res.status(400).json({
                status: 'error',
                message: 'Property is not in trash'
            });
            return;
        }

        // Restore: Remove deletedAt timestamp
        await prisma.bienImmobilier.update({
            where: { id: propertyId },
            data: {
                deletedAt: null
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Property restored successfully'
        });
    } catch (error: any) {
        console.error('Restore property error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to restore property',
            error: error.message
        });
    }
};

/**
 * Permanently delete a property by ID
 * DELETE /api/properties/:id/permanent
 * Protected: Admin only
 * Note: This permanently deletes the property and all associated files
 */
export const permanentlyDeleteProperty = async (req: Request, res: Response): Promise<void> => {
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

        // Check if property exists and get all file attachments
        const existingProperty = await prisma.bienImmobilier.findUnique({
            where: { id: propertyId },
            include: {
                piecesJointes: true
            }
        });

        if (!existingProperty) {
            res.status(404).json({
                status: 'error',
                message: 'Property not found'
            });
            return;
        }

        // Delete physical files from uploads folder
        const fs = await import('fs/promises');
        const path = await import('path');
        
        for (const piece of existingProperty.piecesJointes) {
            // Only delete local files (not external URLs like Google Maps)
            if (piece.url && piece.url.startsWith('/uploads/')) {
                try {
                    // Extract file path from URL (e.g., /uploads/APPARTEMENT/filename.jpg)
                    const filePath = path.join(process.cwd(), piece.url);
                    
                    // Check if file exists before attempting to delete
                    try {
                        await fs.access(filePath);
                        await fs.unlink(filePath);
                        console.log(`Deleted file: ${filePath}`);
                    } catch (err) {
                        // File doesn't exist, skip
                        console.log(`File not found (already deleted?): ${filePath}`);
                    }
                } catch (error) {
                    console.error(`Error deleting file ${piece.url}:`, error);
                    // Continue with deletion even if file deletion fails
                }
            }
        }

        // Delete property (cascade will delete related records)
        await prisma.bienImmobilier.delete({
            where: { id: propertyId }
        });

        res.status(200).json({
            status: 'success',
            message: 'Property and associated files permanently deleted'
        });
    } catch (error: any) {
        console.error('Permanent delete property error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to permanently delete property',
            error: error.message
        });
    }
};
