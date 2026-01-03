import express from "express";
import type { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes";
import propertyRoutes from "./src/routes/propertyRoutes";
import path from 'path';

const app = express();

// Middleware setup

// 1. CORS: Must be first to ensure headers are set for all responses, including static files.
// This fixes the issue where PDF generation fails to fetch images due to missing Access-Control-Allow-Origin headers.
app.use(cors({
  credentials: true,
  origin: true // Allow all origins
}));

// 2. Helmet: Security headers.
// We must allow cross-origin resource sharing for images so the frontend can fetch them for PDF generation.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '10mb' })); // Parse JSON request body with larger limit for file URLs
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(morgan('combined')); // HTTP request logger

// 3. Static Files: Serve uploaded files.
// This allows accessing files via http://domain.com/uploads/TYPE/filename.jpg
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(UPLOAD_ROOT));


// Health check endpoint 
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running correctly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

import uploadRoutes from "./src/routes/uploadRoutes";
import userRoutes from "./src/routes/userRoutes";
import collaborateurRoutes from "./src/routes/collaborateurRoutes";
import demandeRoutes from "./src/routes/demandeRoutes";
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin/collaborateurs', collaborateurRoutes);
app.use('/api/admin/demandes', demandeRoutes);
export default app;
