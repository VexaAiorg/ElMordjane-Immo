import { Request } from 'express';

// Extend Express Request type to include user property
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                role: string;
            };
        }
    }
}

export {};
