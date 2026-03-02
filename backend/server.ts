import app from './app'; // Trigger restart
import dotenv from 'dotenv';
import { ensureAdminUser } from './src/services/adminBootstrapService';
import { initScheduler } from './src/services/schedulerService';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL;

// Validate required environment variables
if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is required');
  process.exit(1);
}

const startServer = async (): Promise<void> => {
  try {
    await ensureAdminUser();

    // Initialize scheduler only after database bootstrap succeeds.
    initScheduler();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to bootstrap server:', error);
    process.exit(1);
  }
};

void startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
