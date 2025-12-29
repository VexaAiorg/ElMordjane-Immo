"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.logout = exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const SALT_ROUNDS = 10;
/**
 * Admin Signup (One-time only)
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
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
        const existingUser = await prisma_1.default.utilisateur.findUnique({
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
        const hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Create user
        const user = await prisma_1.default.utilisateur.create({
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
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            status: 'success',
            message: 'Account created successfully',
            data: {
                user,
                token
            }
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during signup'
        });
    }
};
exports.signup = signup;
/**
 * Admin Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
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
        const user = await prisma_1.default.utilisateur.findUnique({
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
        const isPasswordValid = await bcrypt_1.default.compare(password, user.motDePasse);
        if (!isPasswordValid) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during login'
        });
    }
};
exports.login = login;
/**
 * Admin Logout
 * POST /api/auth/logout
 * Note: With JWT, logout is primarily handled client-side by removing the token
 * This endpoint exists for consistency and future token blacklisting if needed
 */
const logout = async (req, res) => {
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
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during logout'
        });
    }
};
exports.logout = logout;
/**
 * Verify Token (Optional - for checking if user is authenticated)
 * GET /api/auth/verify
 */
const verifyToken = async (req, res) => {
    try {
        // Auth middleware will have already verified the token
        // and attached the user data to req.user
        const user = req.user;
        res.status(200).json({
            status: 'success',
            message: 'Token is valid',
            data: {
                user
            }
        });
    }
    catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during token verification'
        });
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=authController.js.map