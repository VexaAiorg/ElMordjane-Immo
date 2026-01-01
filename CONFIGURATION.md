# 🔐 How to Complete Your Deployment Configuration

## You DON'T need to modify `deploy.sh` - it's complete!

The `deploy.sh` script automatically reads values from `.env.production`.

---

## ✅ What You Need to Provide

### On Your VPS (After Cloning), Create `.env.production`:

```bash
# Step 1: Copy the example file
cp .env.production.example .env.production

# Step 2: Edit with your real values
nano .env.production
```

### Fill in These Values:

```env
# Database Configuration
POSTGRES_USER=sauzxa                    # ✅ Keep this or change if you want
POSTGRES_PASSWORD=YOUR_SECURE_DB_PASSWORD_HERE    # ⚠️ CHANGE THIS!
POSTGRES_DB=ElMordjanDb                 # ✅ Keep this

# Backend Configuration
NODE_ENV=production                     # ✅ Keep this
PORT=3000                               # ✅ Keep this

# Generate a secure JWT secret with: openssl rand -hex 64
JWT_SECRET=YOUR_LONG_RANDOM_JWT_SECRET_HERE       # ⚠️ CHANGE THIS!

# Admin Credentials
ADMIN_EMAIL=admin@yourdomain.com        # ⚠️ CHANGE THIS!
ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD_HERE # ⚠️ CHANGE THIS!

# Domain Configuration (used by Nginx)
DOMAIN=yourdomain.com                   # ⚠️ CHANGE THIS!
```

---

## 🔑 How to Generate Secure Values

### 1. Database Password
```bash
# Generate a strong password (on VPS)
openssl rand -base64 32
# Example output: 8kJ9mN2pQ5rT7vX1zY3wA4bC6dE8fG0h
```

### 2. JWT Secret
```bash
# Generate a secure JWT secret (on VPS)
openssl rand -hex 64
# Example output: 8d53236a8a405f1fe02cf497911ff2cdb772a20a5ab8fd00d59052efc00dc0397dcc1ed6255cad0a560f0696536c74e30ca4bbbe
```

### 3. Admin Password
```bash
# Generate a strong admin password (on VPS)
openssl rand -base64 24
# Example output: 7mK9nP2qR5sU8wX1yZ4aB6cD
```

---

## 📋 Complete Example `.env.production`

Here's what your final `.env.production` should look like:

```env
# Database Configuration
POSTGRES_USER=sauzxa
POSTGRES_PASSWORD=8kJ9mN2pQ5rT7vX1zY3wA4bC6dE8fG0h
POSTGRES_DB=ElMordjanDb

# Backend Configuration
NODE_ENV=production
PORT=3000

# JWT Secret
JWT_SECRET=8d53236a8a405f1fe02cf497911ff2cdb772a20a5ab8fd00d59052efc00dc0397dcc1ed6255cad0a560f0696536c74e30ca4bbbe

# Admin Credentials
ADMIN_EMAIL=admin@elmordjane-immo.com
ADMIN_PASSWORD=7mK9nP2qR5sU8wX1yZ4aB6cD

# Domain Configuration
DOMAIN=elmordjane-immo.com
```

---

## 🚀 Deployment Steps

### On Your VPS:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ElMordjane-Immo.git
cd ElMordjane-Immo

# 2. Create .env.production
cp .env.production.example .env.production

# 3. Generate secrets
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -hex 64)"
echo "ADMIN_PASSWORD=$(openssl rand -base64 24)"

# 4. Edit .env.production with the generated values
nano .env.production

# 5. Deploy!
./deploy.sh
```

---

## ⚠️ Important Notes

1. **Never commit `.env.production`** - It's already in `.gitignore`
2. **Keep these values secret** - They're like your house keys
3. **Save them securely** - Store in a password manager
4. **Different for each environment** - Use different secrets for staging/production

---

## ✅ Checklist Before Running `deploy.sh`

- [ ] `.env.production` file created
- [ ] `POSTGRES_PASSWORD` changed from example
- [ ] `JWT_SECRET` generated with `openssl rand -hex 64`
- [ ] `ADMIN_PASSWORD` changed from example
- [ ] `ADMIN_EMAIL` updated to your email
- [ ] `DOMAIN` set to your actual domain name
- [ ] File is NOT committed to Git

Once all checked, run: `./deploy.sh` 🚀
