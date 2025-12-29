"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const tempUploadMiddleware_1 = require("../middleware/tempUploadMiddleware");
const uploadController_1 = require("../controllers/uploadController");
const router = express_1.default.Router();
// Upload files temporarily (Admins and Collaborateurs can upload)
router.post('/temp', authMiddleware_1.authenticateToken, authMiddleware_1.isAdminOrCollaborateur, tempUploadMiddleware_1.uploadTempFiles, // Multer middleware
uploadController_1.uploadTemp // Controller
);
// Delete temporary file (Admins and Collaborateurs can delete)
router.delete('/temp/:filename', authMiddleware_1.authenticateToken, authMiddleware_1.isAdminOrCollaborateur, uploadController_1.deleteTempFile);
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map