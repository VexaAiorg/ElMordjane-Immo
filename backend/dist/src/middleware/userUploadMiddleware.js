"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfilePicture = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Get upload directory from environment variable or default to project root 'uploads'
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path_1.default.join(process.cwd(), 'uploads');
// Ensure root exists on startup
if (!fs_1.default.existsSync(UPLOAD_ROOT)) {
    try {
        fs_1.default.mkdirSync(UPLOAD_ROOT, { recursive: true });
    }
    catch (err) {
        console.error(`Failed to create upload directory at ${UPLOAD_ROOT}:`, err);
    }
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Create specific folder: UPLOAD_ROOT/PROFILES
        const uploadPath = path_1.default.join(UPLOAD_ROOT, 'PROFILES');
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
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
exports.uploadProfilePicture = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    }
}).single('photoProfil');
//# sourceMappingURL=userUploadMiddleware.js.map