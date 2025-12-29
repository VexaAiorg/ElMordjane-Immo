/**
 * Optimizes an image file in place.
 * - Resizes to max 1920x1920
 * - Compresses to JPEG with 80% quality
 * - Removes metadata
 *
 * @param filePath Absolute path to the image file
 */
export declare const optimizeImage: (filePath: string) => Promise<void>;
//# sourceMappingURL=imageOptimizer.d.ts.map