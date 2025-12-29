"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTempFile = exports.uploadTemp = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path_1.default.join(process.cwd(), 'uploads');
const baseUrl = process.env.APP_BASE_URL || '';
const imageOptimizer_1 = require("../utils/imageOptimizer");
/**
 * Upload files temporarily
 * POST /api/upload/temp
 * Protected: Admin only
 */
const uploadTemp = async (req, res) => {
    try {
        const files = req.files;
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
                    if (fs_1.default.existsSync(f.path))
                        fs_1.default.unlinkSync(f.path);
                });
                res.status(400).json({
                    status: 'error',
                    message: `Le fichier "${file.originalname}" dépasse la limite de 5 Mo.`
                });
                return;
            }
            // 2. Optimize Images
            if (file.mimetype.startsWith('image/')) {
                await (0, imageOptimizer_1.optimizeImage)(file.path);
                // Update size after compression
                try {
                    const stats = fs_1.default.statSync(file.path);
                    file.size = stats.size;
                }
                catch (e) {
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
    }
    catch (error) {
        console.error('Temp upload error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to upload files',
            error: error.message
        });
    }
};
exports.uploadTemp = uploadTemp;
/**
 * Delete a temporarily uploaded file
 * DELETE /api/upload/temp/:filename
 * Protected: Admin only
 */
const deleteTempFile = async (req, res) => {
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
            const filePath = path_1.default.join(UPLOAD_ROOT, folder, filename);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
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
        }
        else {
            res.status(404).json({
                status: 'error',
                message: 'File not found'
            });
        }
    }
    catch (error) {
        console.error('Delete temp file error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete file',
            error: error.message
        });
    }
};
exports.deleteTempFile = deleteTempFile;
//# sourceMappingURL=uploadController.js.map