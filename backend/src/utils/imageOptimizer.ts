import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Optimizes an image file in place.
 * - Resizes to max 1920x1920
 * - Compresses to JPEG with 80% quality
 * - Removes metadata
 * 
 * @param filePath Absolute path to the image file
 */
export const optimizeImage = async (filePath: string): Promise<void> => {
    try {
        // Read file to buffer
        const imageBuffer = await fs.promises.readFile(filePath);

        // Process image
        const processedBuffer = await sharp(imageBuffer)
            .resize(1920, 1920, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: 80,
                mozjpeg: true,
                force: false // Keep original format if not JPEG? No, let's standardize to efficient formats or keep original but compressed
            })
            // Actually, if we want to keep extension but compress, we should handle formats dynamically.
            // But forcing JPEG/WebP is best for size. For mixed usage, let's try to keep format but compress.
            // If we force JPEG, we must change extension. To keep it simple and safe for file extensions:
            // We will just compress based on input format logic or just standard sharp compression.

            // Re-evaluating: user wants compression. 
            // If we convert a PNG to JPEG, we save HUGE space.
            // But we must rename file.
            // To simplify "overwrite in place" without renaming, we stick to:
            // - JPEG -> JPEG (compressed)
            // - PNG -> PNG (compressed)

            // Let's use auto-format logic or format-specific logic.
            .toBuffer();

        // But wait, `sharp(buffer).jpeg()` forces JPEG output. 
        // If we want to support PNG uploads staying as PNG but optimized:

        const metadata = await sharp(imageBuffer).metadata();
        let pipeline = sharp(imageBuffer)
            .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
            .rotate(); // Auto-rotate based on EXIF before stripping

        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
            pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
        } else if (metadata.format === 'png') {
            pipeline = pipeline.png({ quality: 80, compressionLevel: 8, palette: true });
        } else if (metadata.format === 'webp') {
            pipeline = pipeline.webp({ quality: 80 });
        }

        const outputBuffer = await pipeline.toBuffer();

        // Overwrite original
        await fs.promises.writeFile(filePath, outputBuffer);

    } catch (error) {
        console.error('Image optimization failed:', error);
        // We don't throw, just log. If optimization fails, we keep the original file.
    }
};
