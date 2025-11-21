import express from "express";
import type { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

const app = express();

// Middleware setup
app.use(helmet()); // Send appropriate headers to prevent XSS attacks
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
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

export default app;