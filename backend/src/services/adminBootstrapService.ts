import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';

const SALT_ROUNDS = 10;

export const ensureAdminUser = async (): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
//
  if (!adminEmail || !adminPassword) {
    console.warn('Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD is missing.');
    return;
  }

  const existingAdmin = await prisma.utilisateur.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    if (existingAdmin.role !== 'ADMIN') {
      await prisma.utilisateur.update({
        where: { id: existingAdmin.id },
        data: { role: 'ADMIN' }
      });
      console.log(`Updated existing user role to ADMIN for: ${adminEmail}`);
    } else {
      console.log(`Admin user already exists: ${adminEmail}`);
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  await prisma.utilisateur.create({
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
