import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request } from 'express';

// Get upload directory from environment variable or default to project root 'uploads'
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// Temporary uploads go to uploads/TEMP folder
const TEMP_UPLOAD_DIR = path.join(UPLOAD_ROOT, 'TEMP');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
    fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

const tempStorage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        // Get property type from request body
        const type = req.body.type || 'TEMP';
        const uploadPath = path.join(UPLOAD_ROOT, type);
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Sanitize filename
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        // Add timestamp to prevent collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${sanitizedName}`);
    }
});

export const uploadTempFiles = multer({
    storage: tempStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
}).array('files', 50); // Allow up to 50 files at once
