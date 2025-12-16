import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Initialize scheduled tasks
 */
export const initScheduler = () => {
    console.log('⏳ Initializing scheduler...');

    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('🧹 Running daily cleanup of trashed properties...');
        
        try {
            // Calculate the date 30 days ago
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Find properties to delete
            // Condition: deletedAt is NOT null AND deletedAt < 30 days ago
            const propertiesToDelete = await prisma.bienImmobilier.findMany({
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
                            const filePath = path.join(process.cwd(), piece.url);
                            await fs.unlink(filePath).catch(() => {}); // Ignore if file not found
                        } catch (err) {
                            console.error(`Error deleting file ${piece.url}:`, err);
                        }
                    }
                }

                // Delete property (cascade handles relations)
                await prisma.bienImmobilier.delete({
                    where: { id: property.id }
                });
            }

            console.log(`✅ Successfully deleted ${propertiesToDelete.length} old trashed properties.`);

        } catch (error) {
            console.error('❌ Error running daily cleanup:', error);
        }
    });

    console.log('✅ Scheduler initialized: Daily cleanup scheduled for 00:00.');
};
