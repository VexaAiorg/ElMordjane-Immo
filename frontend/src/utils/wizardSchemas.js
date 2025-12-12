import { z } from 'zod';

// Page 1: Basic Information
export const basicInfoSchema = z.object({
    titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
    description: z.string().optional(),
    type: z.string().min(1, 'Il faut choisir un type de bien').refine(
        (val) => ['APPARTEMENT', 'TERRAIN', 'VILLA', 'LOCAL', 'IMMEUBLE'].includes(val),
        { message: 'Il faut choisir un type de bien' }
    ),
    transaction: z.string().min(1, 'Il faut choisir un type de transaction').refine(
        (val) => ['VENTE', 'LOCATION'].includes(val),
        { message: 'Il faut choisir un type de transaction' }
    ),
    statut: z.string().default('DISPONIBLE'),
    prixVente: z.number({ invalid_type_error: 'Le prix doit être un nombre' }).positive('Le prix doit être positif').optional(),
    prixLocation: z.number({ invalid_type_error: 'Le prix doit être un nombre' }).positive('Le prix doit être positif').optional(),
    adresse: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
}).refine((data) => {
    // Ensure appropriate price is filled based on transaction type
    if (data.transaction === 'VENTE' && !data.prixVente) return false;
    if (data.transaction === 'LOCATION' && !data.prixLocation) return false;
    return true;
}, {
    message: 'Le prix est requis',
    path: ['prixVente'],
});

// Page 2: Owner Information
export const ownerInfoSchema = z.object({
    isNewOwner: z.boolean().default(true),
    proprietaireId: z.number().optional(), // If selecting existing owner
    // New owner fields - made optional here, validated in superRefine
    nom: z.string().optional(),
    prenom: z.string().optional(),
    telephone: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    adresse: z.string().optional(),
    // Identity
    typeIdentite: z.enum(['CNI', 'PC', 'PP']).optional(),
    numIdentite: z.string().optional(),
    // Quality
    qualite: z.enum(['PROPRIETAIRE', 'HERITIER', 'PROCUREUR']).optional(),
    // Prix info
    prixType: z.enum(['DEMANDE', 'OFFERT']).optional(),
    prixNature: z.enum(['FERME', 'FIXE', 'NEGOCIABLE']).optional(),
    prixSource: z.enum(['A_MON_NIVEAU', 'AILLEURS']).optional(),
    // Payment
    paiementVente: z.enum(['CREDIT', 'CACHE']).optional(),
    paiementLocation: z.enum(['ANNUEL', 'SEMESTRIEL', 'JOURNALIER']).optional(),
}).superRefine((data, ctx) => {
    if (data.isNewOwner) {
        if (!data.nom || data.nom.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Le nom doit contenir au moins 2 caractères',
                path: ['nom'],
            });
        }
        if (!data.prenom || data.prenom.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Le prénom doit contenir au moins 2 caractères',
                path: ['prenom'],
            });
        }
        if (!data.telephone || data.telephone.length !== 10) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Le numéro doit contenir 10 chiffres',
                path: ['telephone'],
            });
        }
    } else {
        if (!data.proprietaireId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Veuillez sélectionner un propriétaire',
                path: ['proprietaireId'],
            });
        }
    }
});

// Page 3: Property Details (Dynamic based on type)
export const appartementDetailsSchema = z.object({
    typeAppart: z.string().optional(),
    surfaceTotal: z.number({ invalid_type_error: 'La surface doit être un nombre' }).positive('La surface doit être positive').optional(),
    surfaceSalon: z.number({ invalid_type_error: 'La surface doit être un nombre' }).positive('La surface doit être positive').optional(),
    surfaceChambre: z.number({ invalid_type_error: 'La surface doit être un nombre' }).positive('La surface doit être positive').optional(),
    surfaceCuisine: z.number({ invalid_type_error: 'La surface doit être un nombre' }).positive('La surface doit être positive').optional(),
    surfaceSDB: z.number({ invalid_type_error: 'La surface doit être un nombre' }).positive('La surface doit être positive').optional(),
    etage: z.number({ invalid_type_error: 'L\'étage doit être un nombre' }).int('L\'étage doit être un nombre entier').optional(),
    finition: z.string().optional(),
    anneeConstruction: z.number({ invalid_type_error: 'L\'année doit être un nombre' }).int('L\'année doit être un nombre entier').min(1900, 'Année invalide').max(new Date().getFullYear(), 'Année invalide').optional(),
    ascenseur: z.boolean().default(false),
    chauffage: z.enum(['CENTRAL', 'BAINS', 'AUTRE']).optional(),
    climatisation: z.boolean().default(false),
    cuisineEquipee: z.boolean().default(false),
    meuble: z.boolean().default(false),
    parking: z.boolean().default(false),
    gardinage: z.boolean().default(false),
    proximiteEcole: z.boolean().default(false),
    proximiteTransport: z.array(z.enum(['BUS', 'TRAMWAY', 'METRO', 'TRAIN'])).optional(),
    proximitePlage: z.boolean().default(false),
    proximiteAeroport: z.boolean().default(false),
});

export const terrainDetailsSchema = z.object({
    surface: z.number({ invalid_type_error: 'La surface doit être un nombre' }).positive('La surface doit être positive'),
    vocation: z.string().optional(),
    longueur: z.number({ invalid_type_error: 'La longueur doit être un nombre' }).positive('La longueur doit être positive').optional(),
    largeur: z.number({ invalid_type_error: 'La largeur doit être un nombre' }).positive('La largeur doit être positive').optional(),
    facades: z.number({ invalid_type_error: 'Le nombre de façades doit être un nombre' }).int('Le nombre de façades doit être un entier').positive('Le nombre de façades doit être positif').optional(),
    viabilise: z.boolean().default(false),
    statutJuridique: z.string().optional(),
});

export const villaDetailsSchema = terrainDetailsSchema.extend({
    surfaceBatie: z.number({ invalid_type_error: 'La surface doit être un nombre' }).positive('La surface doit être positive').optional(),
    etages: z.number({ invalid_type_error: 'Le nombre d\'étages doit être un nombre' }).int('Le nombre d\'étages doit être un entier').optional(),
    pieces: z.number({ invalid_type_error: 'Le nombre de pièces doit être un nombre' }).int('Le nombre de pièces doit être un entier').positive('Le nombre de pièces doit être positif').optional(),
    etat: z.enum(['RECENTE', 'A_DEMOLIR', 'A_REFAIRE']).optional(),
    composition: z.string().optional(),
    jardin: z.boolean().default(false),
    garage: z.boolean().default(false),
    piscine: z.boolean().default(false),
});

export const localDetailsSchema = z.object({
    surface: z.number({ invalid_type_error: 'La surface doit être un nombre' }).positive('La surface doit être positive'),
    typeActivite: z.enum(['BUREAU', 'OPEN_SPACE', 'RDC', 'AUTRE']).optional(),
    hauteur: z.number({ invalid_type_error: 'La hauteur doit être un nombre' }).positive('La hauteur doit être positive').optional(),
    facades: z.number({ invalid_type_error: 'Le nombre de façades doit être un nombre' }).int('Le nombre de façades doit être un entier').positive('Le nombre de façades doit être positif').optional(),
});

export const immeubleDetailsSchema = villaDetailsSchema.extend({
    nbAppartements: z.number({ invalid_type_error: 'Le nombre d\'appartements doit être un nombre' }).int('Le nombre d\'appartements doit être un entier').positive('Le nombre d\'appartements doit être positif').optional(),
    surfaceSol: z.number({ invalid_type_error: 'La surface doit être un nombre' }).positive('La surface doit être positive').optional(),
});

// Page 4: Documents (validation for files will be handled in component)
export const documentsSchema = z.object({
    papiers: z.array(z.object({
        nom: z.string(),
        statut: z.enum(['DISPONIBLE', 'MANQUANT', 'EN_COURS']).optional(),
        file: z.any().optional(),
    })).optional(),
});

// Page 5: Tracking
export const trackingSchema = z.object({
    estVisite: z.boolean().default(false),
    priorite: z.enum(['TRES_IMPORTANT', 'IMPORTANT', 'NORMAL']).default('NORMAL'),
    aMandat: z.boolean().default(false),
    urlGoogleSheet: z.string().url('URL invalide').optional().or(z.literal('')),
    urlGooglePhotos: z.string().url('URL invalide').optional().or(z.literal('')),
});

// Page 6: Attachments
export const attachmentsSchema = z.object({
    piecesJointes: z.array(z.object({
        type: z.enum(['DOCUMENT', 'PHOTO', 'LOCALISATION']),
        visibilite: z.enum(['PUBLIABLE', 'INTERNE']).default('INTERNE'),
        file: z.any().optional(),
        url: z.string().optional(),
        nom: z.string().optional(),
    })).optional(),
});

// Helper function to get the appropriate details schema based on property type
export const getDetailsSchema = (propertyType) => {
    switch (propertyType) {
        case 'APPARTEMENT':
            return appartementDetailsSchema;
        case 'TERRAIN':
            return terrainDetailsSchema;
        case 'VILLA':
            return villaDetailsSchema;
        case 'LOCAL':
            return localDetailsSchema;
        case 'IMMEUBLE':
            return immeubleDetailsSchema;
        default:
            return z.object({});
    }
};
