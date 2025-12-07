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
        console.log('🧹 Running daily cleanup of archived properties...');
        
        try {
            // Calculate the date 30 days ago
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Find properties to delete
            // Condition: archive = true AND dateCreation < 30 days ago
            const propertiesToDelete = await prisma.bienImmobilier.findMany({
                where: {
                    archive: true,
                    dateCreation: {
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

            console.log(`found ${propertiesToDelete.length} properties to delete.`);

            for (const property of propertiesToDelete) {
                console.log(`🗑️ Deleting property ID ${property.id} (Created: ${property.dateCreation.toISOString()})`);

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

            console.log(`✅ Successfully deleted ${propertiesToDelete.length} old archived properties.`);

        } catch (error) {
            console.error('❌ Error running daily cleanup:', error);
        }
    });

    console.log('✅ Scheduler initialized: Daily cleanup scheduled for 00:00.');
};
