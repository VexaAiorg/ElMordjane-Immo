import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request } from 'express';

// Get upload directory from environment variable or default to project root 'uploads'
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// Ensure root exists on startup
if (!fs.existsSync(UPLOAD_ROOT)) {
    try {
        fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
    } catch (err) {
        console.error(`Failed to create upload directory at ${UPLOAD_ROOT}:`, err);
    }
}

const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        // Create specific folder: UPLOAD_ROOT/PROFILES
        const uploadPath = path.join(UPLOAD_ROOT, 'PROFILES');
        
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
        cb(null, `pfp-${uniqueSuffix}-${sanitizedName}`);
    }
});

export const uploadProfilePicture = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
}).single('photoProfil');
