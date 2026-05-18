#!/usr/bin/env bash
set -euo pipefail

TARGET_IP="coreveta.com"
REMOTE_DIR="/var/www/teknikos"
BACKUP_DIR="/root/coreveta_backups"
TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"
BACKUP_FILE="$BACKUP_DIR/coreveta_backup_$TIMESTAMP.tar.gz"

echo "Connecting to $TARGET_IP to stop services and backup data..."

ssh root@$TARGET_IP << EOF
  echo "1. Stopping PM2 services..."
  pm2 stop all
  pm2 save
  
  echo "2. Creating backup directory..."
  mkdir -p $BACKUP_DIR
  
  echo "3. Archiving database and environment configurations..."
  cd $REMOTE_DIR
  tar -czvf $BACKUP_FILE backend/data backend/teknikos.db backend/.env frontend/.env || echo "Warning: Some files might be missing, continuing anyway."
  
  echo "4. Backup completed at $BACKUP_FILE"
  echo "Services are now offline. Safe to shut down the VPS."
EOF

echo "Done! You can now download the backup using:"
echo "scp root@$TARGET_IP:$BACKUP_FILE ./coreveta_backup.tar.gz"
