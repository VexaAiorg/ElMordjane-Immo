"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const collaborateurController_js_1 = require("../controllers/collaborateurController.js");
const router = express_1.default.Router();
// All routes require authentication and admin privileges
router.use(authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin);
// GET /api/admin/collaborateurs - Get all collaborateurs
router.get('/', collaborateurController_js_1.getAllCollaborateurs);
// GET /api/admin/collaborateurs/:id/properties - Get properties created by collaborateur
router.get('/:id/properties', collaborateurController_js_1.getCollaborateurProperties);
// GET /api/admin/collaborateurs/:id - Get single collaborateur
router.get('/:id', collaborateurController_js_1.getCollaborateurById);
// PUT /api/admin/collaborateurs/:id - Update collaborateur
router.put('/:id', collaborateurController_js_1.updateCollaborateur);
// POST /api/admin/collaborateurs - Create new collaborateur
router.post('/', collaborateurController_js_1.createCollaborateur);
// DELETE /api/admin/collaborateurs/:id - Delete collaborateur
router.delete('/:id', collaborateurController_js_1.deleteCollaborateur);
exports.default = router;
//# sourceMappingURL=collaborateurRoutes.js.map