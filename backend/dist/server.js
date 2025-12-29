"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app")); // Trigger restart
const dotenv_1 = __importDefault(require("dotenv"));
const schedulerService_1 = require("./src/services/schedulerService");
// Load environment variables
dotenv_1.default.config();
// Initialize Scheduler
(0, schedulerService_1.initScheduler)();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
// Validate required environment variables
if (!DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is required');
    process.exit(1);
}
// Start the server
app_1.default.listen(PORT, () => {
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
//# sourceMappingURL=server.js.map