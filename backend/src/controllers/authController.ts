import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const SALT_ROUNDS = 10;

/**
 * Admin Signup (One-time only)
 * POST /api/auth/signup
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, nom, prenom, role } = req.body;

        // Validate input
        if (!email || !password || !nom || !prenom) {
            res.status(400).json({
                status: 'error',
                message: 'Email, password, nom, and prenom are required'
            });
            return;
        }

        // Check if email is already taken
        const existingUser = await prisma.utilisateur.findUnique({
            where: { email }
        });

        if (existingUser) {
            res.status(409).json({
                status: 'error',
                message: 'Email already registered'
            });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = await prisma.utilisateur.create({
            data: {
                email,
                motDePasse: hashedPassword,
                role: role || 'COLLABORATEUR', // Default to COLLABORATEUR if not specified
                nom,
                prenom
            },
            select: {
                id: true,
                email: true,
                role: true,
                nom: true,
                prenom: true,
                dateCreation: true
            }
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            status: 'success',
            message: 'Account created successfully',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during signup'
        });
    }
};

/**
 * Admin Login
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
            return;
        }

        // Find user by email
        const user = await prisma.utilisateur.findUnique({
            where: { email }
        });

        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.motDePasse);

        if (!isPasswordValid) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    dateCreation: user.dateCreation
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during login'
        });
    }
};

/**
 * Admin Logout
 * POST /api/auth/logout
 * Note: With JWT, logout is primarily handled client-side by removing the token
 * This endpoint exists for consistency and future token blacklisting if needed
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        // In a JWT-based system, logout is typically handled client-side
        // The client should remove the token from storage
        // 
        // For enhanced security, you could implement:
        // - Token blacklisting
        // - Refresh token revocation
        // - Session tracking

        res.status(200).json({
            status: 'success',
            message: 'Logout successful. Please remove the token from client storage.'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during logout'
        });
    }
};

/**
 * Verify Token (Optional - for checking if user is authenticated)
 * GET /api/auth/verify
 */
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
    try {
        // Auth middleware will have already verified the token
        // and attached the user data to req.user
        const user = (req as any).user;

        res.status(200).json({
            status: 'success',
            message: 'Token is valid',
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during token verification'
        });
    }
};
