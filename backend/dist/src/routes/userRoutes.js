"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const userUploadMiddleware_1 = require("../middleware/userUploadMiddleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.authenticateToken);
router.get('/profile', userController_1.getProfile);
router.put('/profile', userUploadMiddleware_1.uploadProfilePicture, userController_1.updateProfile);
router.put('/password', userController_1.updatePassword);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map