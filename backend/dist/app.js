"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const propertyRoutes_1 = __importDefault(require("./src/routes/propertyRoutes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Middleware setup
// 1. CORS: Must be first to ensure headers are set for all responses, including static files.
// This fixes the issue where PDF generation fails to fetch images due to missing Access-Control-Allow-Origin headers.
app.use((0, cors_1.default)({
    credentials: true,
    origin: true // Allow all origins
}));
// 2. Helmet: Security headers.
// We must allow cross-origin resource sharing for images so the frontend can fetch them for PDF generation.
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express_1.default.json({ limit: '10mb' })); // Parse JSON request body with larger limit for file URLs
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use((0, morgan_1.default)('combined')); // HTTP request logger
// 3. Static Files: Serve uploaded files.
// This allows accessing files via http://domain.com/uploads/TYPE/filename.jpg
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path_1.default.join(process.cwd(), 'uploads');
app.use('/uploads', express_1.default.static(UPLOAD_ROOT));
// Health check endpoint 
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running correctly',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
const uploadRoutes_1 = __importDefault(require("./src/routes/uploadRoutes"));
const userRoutes_1 = __importDefault(require("./src/routes/userRoutes"));
const collaborateurRoutes_1 = __importDefault(require("./src/routes/collaborateurRoutes"));
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/properties', propertyRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
app.use('/api/admin/collaborateurs', collaborateurRoutes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map