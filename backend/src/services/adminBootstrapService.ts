import bcrypt from 'bcrypt';
import pool from '../lib/db';

const SALT_ROUNDS = 10;

export const ensureAdminUser = async (): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
//
  if (!adminEmail || !adminPassword) {
    console.warn('Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD is missing.');
    return;
  }

  const { rows } = await pool.query<{ id: number; role: string }>(
    'SELECT id, role FROM "Utilisateur" WHERE email = $1 LIMIT 1',
    [adminEmail]
  );
  const existingAdmin = rows[0] ?? null;

  if (existingAdmin) {
    if (existingAdmin.role !== 'ADMIN') {
      await pool.query(
        'UPDATE "Utilisateur" SET role = $1 WHERE id = $2',
        ['ADMIN', existingAdmin.id]
      );
      console.log(`Updated existing user role to ADMIN for: ${adminEmail}`);
    } else {
      console.log(`Admin user already exists: ${adminEmail}`);
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  await pool.query(
    `INSERT INTO "Utilisateur" (email, "motDePasse", role, nom, prenom)
     VALUES ($1, $2, $3, $4, $5)`,
    [adminEmail, hashedPassword, 'ADMIN', 'Admin', 'System']
  );

  console.log(`Admin user created: ${adminEmail}`);
};
