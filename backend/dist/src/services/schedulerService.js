"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
/**
 * Initialize scheduled tasks
 */
const initScheduler = () => {
    console.log('⏳ Initializing scheduler...');
    // Run every day at midnight (00:00)
    node_cron_1.default.schedule('0 0 * * *', async () => {
        console.log('🧹 Running daily cleanup of trashed properties...');
        try {
            // Calculate the date 30 days ago
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            // Find properties to delete
            // Condition: deletedAt is NOT null AND deletedAt < 30 days ago
            const propertiesToDelete = await prisma_1.default.bienImmobilier.findMany({
                where: {
                    deletedAt: {
                        not: null,
                        lt: thirtyDaysAgo
                    }
                },
                include: {
                    piecesJointes: true
                }
            });
            if (propertiesToDelete.length === 0) {
                console.log('✅ No properties found for auto-deletion.');
                return;
            }
            console.log(`📋 Found ${propertiesToDelete.length} properties to permanently delete.`);
            for (const property of propertiesToDelete) {
                console.log(`🗑️ Deleting property ID ${property.id} (Deleted on: ${property.deletedAt?.toISOString()})`);
                // Delete physical files
                for (const piece of property.piecesJointes) {
                    if (piece.url && piece.url.startsWith('/uploads/')) {
                        try {
                            const filePath = path_1.default.join(process.cwd(), piece.url);
                            await promises_1.default.unlink(filePath).catch(() => { }); // Ignore if file not found
                        }
                        catch (err) {
                            console.error(`Error deleting file ${piece.url}:`, err);
                        }
                    }
                }
                // Delete property (cascade handles relations)
                await prisma_1.default.bienImmobilier.delete({
                    where: { id: property.id }
                });
            }
            console.log(`✅ Successfully deleted ${propertiesToDelete.length} old trashed properties.`);
        }
        catch (error) {
            console.error('❌ Error running daily cleanup:', error);
        }
    });
    console.log('✅ Scheduler initialized: Daily cleanup scheduled for 00:00.');
};
exports.initScheduler = initScheduler;
//# sourceMappingURL=schedulerService.js.map