import express from "express";
import type { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import propertyRoutes from "./src/routes/propertyRoutes.js";

const app = express();

// Serve uploaded files statically
// This allows accessing files via http://domain.com/uploads/TYPE/filename.jpg
// It matches the directory structure defined in uploadMiddleware.ts
import path from 'path';
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(UPLOAD_ROOT));


// Middleware setup
app.use(helmet()); // Send appropriate headers to prevent XSS attacks
app.use(express.json({ limit: '10mb' })); // Parse JSON request body with larger limit for file URLs
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(morgan('combined')); // HTTP request logger
app.use(cors({
  credentials: true,
  origin: true // Allow all origins
})); // Configure CORS properly

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running correctly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

import uploadRoutes from "./src/routes/uploadRoutes.js";

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/upload', uploadRoutes);

export default app;