import app from './app.js';
import dotenv from 'dotenv';
// import { verifyCloudinaryConfig } from './config/cloudinary.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

// Validate required environment variables
if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is required');
  process.exit(1);
}

// Verify Cloudinary configuration (uncomment when cloudinary config is ready)
// verifyCloudinaryConfig();

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});