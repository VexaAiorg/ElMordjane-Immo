"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTempFiles = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Get upload directory from environment variable or default to project root 'uploads'
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path_1.default.join(process.cwd(), 'uploads');
// Temporary uploads go to uploads/TEMP folder
const TEMP_UPLOAD_DIR = path_1.default.join(UPLOAD_ROOT, 'TEMP');
// Ensure temp directory exists
if (!fs_1.default.existsSync(TEMP_UPLOAD_DIR)) {
    fs_1.default.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}
const tempStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Get property type from request body
        const type = req.body.type || 'TEMP';
        const uploadPath = path_1.default.join(UPLOAD_ROOT, type);
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
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
exports.uploadTempFiles = (0, multer_1.default)({
    storage: tempStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Accept images, PDFs, and Word documents
        if (file.mimetype.startsWith('image/') ||
            file.mimetype === 'application/pdf' ||
            file.mimetype.includes('word') ||
            file.mimetype.includes('officedocument')) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    }
}).array('files', 50); // Allow up to 50 files at once
//# sourceMappingURL=tempUploadMiddleware.js.map