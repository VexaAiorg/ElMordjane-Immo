import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const baseUrl = process.env.APP_BASE_URL || '';

import { optimizeImage } from '../utils/imageOptimizer';

/**
 * Upload files temporarily
 * POST /api/upload/temp
 * Protected: Admin only
 */
export const uploadTemp = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            res.status(400).json({
                status: 'error',
                message: 'No files uploaded'
            });
            return;
        }

        const type = req.body.type || 'TEMP';
        const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5MB

        // Process files: Validate size for docs & Optimize images
        for (const file of files) {
            // 1. Check Document Size Limit
            if (!file.mimetype.startsWith('image/') && file.size > MAX_DOC_SIZE) {
                // Cleanup: Delete all files from this request since we are failing
                files.forEach(f => {
                    if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
                });

                res.status(400).json({
                    status: 'error',
                    message: `Le fichier "${file.originalname}" dépasse la limite de 5 Mo.`
                });
                return;
            }

            // 2. Optimize Images
            if (file.mimetype.startsWith('image/')) {
                await optimizeImage(file.path);
                // Update size after compression
                try {
                    const stats = fs.statSync(file.path);
                    file.size = stats.size;
                } catch (e) {
                    console.error('Failed to update file stats:', e);
                }
            }
        }

        // Generate URLs for uploaded files
        const uploadedFiles = files.map(file => ({
            url: `${baseUrl}/uploads/${type}/${file.filename}`,
            filename: file.filename,
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype
        }));

        console.log(`Uploaded ${files.length} files temporarily to ${type}/`);

        res.status(200).json({
            status: 'success',
            message: `${files.length} file(s) uploaded successfully`,
            files: uploadedFiles
        });
    } catch (error: any) {
        console.error('Temp upload error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to upload files',
            error: error.message
        });
    }
};

/**
 * Delete a temporarily uploaded file
 * DELETE /api/upload/temp/:filename
 * Protected: Admin only
 */
export const deleteTempFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { filename } = req.params;
        const { type } = req.query;

        if (!filename) {
            res.status(400).json({
                status: 'error',
                message: 'Filename is required'
            });
            return;
        }

        // Find file in all type folders
        const typeFolders = ['TEMP', 'VILLA', 'APPARTEMENT', 'TERRAIN', 'LOCAL', 'IMMEUBLE', 'AUTRE'];
        let deleted = false;

        for (const folder of typeFolders) {
            const filePath = path.join(UPLOAD_ROOT, folder, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                deleted = true;
                console.log(`Deleted temp file: ${folder}/${filename}`);
                break;
            }
        }

        if (deleted) {
            res.status(200).json({
                status: 'success',
                message: 'File deleted successfully'
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: 'File not found'
            });
        }
    } catch (error: any) {
        console.error('Delete temp file error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete file',
            error: error.message
        });
    }
};
