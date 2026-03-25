#!/bin/bash

# Configuration
BACKUP_DIR="/var/www/teknikos/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="teknikos"
DB_USER="postgres"
RETENTION_DAYS=7

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

echo "Starting backup of $DB_NAME..."

# Run pg_dump within the docker container
docker exec teknikos-postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_$TIMESTAMP.sql.gz

if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_DIR/${DB_NAME}_$TIMESTAMP.sql.gz"
else
    echo "Backup failed!"
    exit 1
fi

# Rotate old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup process completed."
