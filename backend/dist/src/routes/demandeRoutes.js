"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const demandeController_1 = require("../controllers/demandeController");
const router = express_1.default.Router();
// All routes require authentication and admin privileges
router.use(authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin);
// POST /api/admin/demandes - Create new demande
router.post('/', demandeController_1.createDemande);
// GET /api/admin/demandes - Get all demandes
router.get('/', demandeController_1.getAllDemandes);
// GET /api/admin/demandes/:id - Get single demande
router.get('/:id', demandeController_1.getDemandeById);
// PUT /api/admin/demandes/:id - Update demande
router.put('/:id', demandeController_1.updateDemande);
// DELETE /api/admin/demandes/:id - Delete demande
router.delete('/:id', demandeController_1.deleteDemande);
exports.default = router;
//# sourceMappingURL=demandeRoutes.js.map