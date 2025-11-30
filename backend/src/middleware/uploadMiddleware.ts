import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request } from 'express';

// Get upload directory from environment variable or default to project root 'uploads'
// This allows storing files outside the project directory in production
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// Ensure root exists on startup
if (!fs.existsSync(UPLOAD_ROOT)) {
    try {
        fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
        console.log(`Upload directory initialized at: ${UPLOAD_ROOT}`);
    } catch (err) {
        console.error(`Failed to create upload directory at ${UPLOAD_ROOT}:`, err);
    }
}

const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        // Parse property type from the 'data' field to organize folders
        let type = 'AUTRE';
        if (req.body.data) {
            try {
                const data = JSON.parse(req.body.data);
                if (data.bienImmobilier?.type) {
                    type = data.bienImmobilier.type.toUpperCase();
                }
            } catch (e) {
                console.warn('Could not parse data for folder naming, using default');
            }
        }

        // Create specific folder: UPLOAD_ROOT/TYPE
        // Example: /var/www/uploads/VILLA or /project/uploads/APPARTEMENT
        const uploadPath = path.join(UPLOAD_ROOT, type);
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Sanitize filename to remove special characters
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        // Add timestamp to prevent collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${sanitizedName}`);
    }
});

export const uploadPropertyFiles = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
    fileFilter: (req, file, cb) => {
        // Accept images, PDFs, and Word documents
        if (file.mimetype.startsWith('image/') || 
            file.mimetype === 'application/pdf' ||
            file.mimetype.includes('word') ||
            file.mimetype.includes('officedocument')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
}).fields([
    { name: 'documents', maxCount: 20 },
    { name: 'photos', maxCount: 30 }
]);
