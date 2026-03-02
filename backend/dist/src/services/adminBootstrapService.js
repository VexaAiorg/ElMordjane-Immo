"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAdminUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const SALT_ROUNDS = 10;
const ensureAdminUser = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
        console.warn('Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD is missing.');
        return;
    }
    const existingAdmin = await prisma_1.default.utilisateur.findUnique({
        where: { email: adminEmail }
    });
    if (existingAdmin) {
        if (existingAdmin.role !== 'ADMIN') {
            await prisma_1.default.utilisateur.update({
                where: { id: existingAdmin.id },
                data: { role: 'ADMIN' }
            });
            console.log(`Updated existing user role to ADMIN for: ${adminEmail}`);
        }
        else {
            console.log(`Admin user already exists: ${adminEmail}`);
        }
        return;
    }
    const hashedPassword = await bcrypt_1.default.hash(adminPassword, SALT_ROUNDS);
    await prisma_1.default.utilisateur.create({
        data: {
            email: adminEmail,
            motDePasse: hashedPassword,
            role: 'ADMIN',
            nom: 'Admin',
            prenom: 'System'
        }
    });
    console.log(`Admin user created: ${adminEmail}`);
};
exports.ensureAdminUser = ensureAdminUser;
//# sourceMappingURL=adminBootstrapService.js.map