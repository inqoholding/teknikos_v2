# Coreveta VPS Migration & Setup Guide

This document outlines the step-by-step process for setting up a new VPS for the Coreveta application, restoring data from backup, and re-activating the application.

## 1. Initial VPS Setup
1. **Provision the Server**: Create a new Ubuntu 22.04 LTS VPS (at least 2 vCPUs, 4GB RAM).
2. **Update System Packages**:
   ```bash
   apt update && apt upgrade -y
   ```
3. **Install Dependencies**:
   ```bash
   apt install -y curl git rsync build-essential nginx sqlite3 ufw expect
   ```
4. **Install Node.js & PM2**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs
   npm install -g pm2
   ```

## 2. Security & Firewall (ufw) Configuration
1. Allow standard web traffic and SSH:
   ```bash
   ufw allow OpenSSH
   ufw allow 'Nginx Full'
   ufw enable
   ```

## 3. Deploying the Application
1. **Prepare Directory**:
   ```bash
   mkdir -p /var/www/teknikos
   ```
2. **Clone / Sync Application Code**:
   From your local machine, run the rsync deployment script or clone from GitHub:
   ```bash
   # If using git:
   git clone https://github.com/inqoholding/teknikos_v2.git /var/www/teknikos
   ```

## 4. Restoring Configuration and Data
1. **Restore Environment Variables**:
   Copy the backed-up `.env` files to their respective directories.
   - `backend/.env`
   - `frontend/.env`
2. **Restore SQLite Database**:
   Copy the backed-up database to the backend data directory:
   ```bash
   # Example assuming backup is in /root/coreveta_backup.tar.gz
   tar -xzvf /root/coreveta_backup.tar.gz -C /var/www/teknikos/
   ```
   *Ensure the restored `teknikos.db` and its directory have proper permissions.*

## 5. Build and Install Dependencies
Navigate to the application root (`/var/www/teknikos`) and run:
```bash
npm install
npm run install:frontend
npm run install:backend
npm run build:all
```

## 6. Configure Nginx
1. Copy the Nginx configuration:
   ```bash
   cp deploy/nginx.teknikos.conf /etc/nginx/sites-available/teknikos
   ln -s /etc/nginx/sites-available/teknikos /etc/nginx/sites-enabled/
   # Remove default nginx site
   rm /etc/nginx/sites-enabled/default
   ```
2. Test and Restart Nginx:
   ```bash
   nginx -t
   systemctl restart nginx
   ```
3. Set up SSL (Let's Encrypt):
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d coreveta.com
   ```

## 7. Starting the Application
Start the backend using PM2:
```bash
cd /var/www/teknikos/backend
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 8. Verification
1. Access `https://coreveta.com` in a browser.
2. Check the PM2 logs to ensure the backend is running without errors: `pm2 logs`.
3. Verify that the restored data (businesses, jobs) appears in the dashboard.
