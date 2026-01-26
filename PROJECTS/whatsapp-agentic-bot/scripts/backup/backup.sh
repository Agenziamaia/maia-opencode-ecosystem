#!/bin/bash

# ==========================================
# Local Backup Script
# Runs on Mac every 15 minutes via cron
# ==========================================

set -e

# Configuration
PROJECT_DIR="/Users/g/Desktop/MAIA opencode/whatsapp-agentic-bot"
BACKUP_DIR="${PROJECT_DIR}/backups"
LOG_FILE="${PROJECT_DIR}/logs/backup.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create directories if they don't exist
mkdir -p "${BACKUP_DIR}/data"
mkdir -p "${BACKUP_DIR}/logs"
mkdir -p "${PROJECT_DIR}/logs"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting backup..."

# ==========================================
# Step 1: Backup SQLite Database
# ==========================================

log "Backing up SQLite database..."

DB_PATH="${PROJECT_DIR}/data/hotel-bot.db"

if [ -f "$DB_PATH" ]; then
    # Online backup (SQLite specific)
    sqlite3 "$DB_PATH" ".backup '${BACKUP_DIR}/data/hotel-bot-${TIMESTAMP}.db'"

    if [ $? -eq 0 ]; then
        log "✅ SQLite backup successful"

        # Verify backup integrity
        sqlite3 "${BACKUP_DIR}/data/hotel-bot-${TIMESTAMP}.db" "PRAGMA integrity_check;" > /dev/null

        if [ $? -eq 0 ]; then
            log "✅ Backup integrity verified"
        else
            log "❌ Backup integrity check failed!"
            exit 1
        fi
    else
        log "❌ SQLite backup failed!"
        exit 1
    fi
else
    log "⚠️ Database file not found at $DB_PATH"
fi

# ==========================================
# Step 2: Backup Redis RDB
# ==========================================

log "Backing up Redis RDB..."

# Trigger Redis save
redis-cli BGSAVE > /dev/null 2>&1

# Wait for save to complete
sleep 5

# Copy RDB file
REDIS_RDB="/usr/local/var/db/redis/dump.rdb"

if [ -f "$REDIS_RDB" ]; then
    cp "$REDIS_RDB" "${BACKUP_DIR}/data/redis-${TIMESTAMP}.rdb"

    if [ $? -eq 0 ]; then
        log "✅ Redis backup successful"
    else
        log "❌ Redis backup failed!"
        exit 1
    fi
else
    log "⚠️ Redis RDB file not found at $REDIS_RDB"
fi

# ==========================================
# Step 3: Backup Logs
# ==========================================

log "Backing up logs..."

# Copy log files from last hour
find "${PROJECT_DIR}/logs" -name "*.log" -mmin -60 -exec cp {} "${BACKUP_DIR}/logs/" \;

log "✅ Logs backup successful"

# ==========================================
# Step 4: Upload to VPS (if configured)
# ==========================================

if [ -n "$BACKUP_VPS_HOST" ] && [ -n "$BACKUP_VPS_USER" ]; then
    log "Syncing to VPS..."

    # Sync to backup VPS using rsync
    rsync -avz --delete \
        "${BACKUP_DIR}/" \
        "${BACKUP_VPS_USER}@${BACKUP_VPS_HOST}:/backups/" \
        >> "$LOG_FILE" 2>&1

    if [ $? -eq 0 ]; then
        log "✅ VPS sync successful"
    else
        log "⚠️ VPS sync failed (continuing...)"
    fi
fi

# ==========================================
# Step 5: Rotate Old Backups
# ==========================================

log "Rotating old backups..."

# Remove SQLite backups older than RETENTION_DAYS
find "${BACKUP_DIR}/data" -name "hotel-bot-*.db" -mtime +$RETENTION_DAYS -delete

# Remove Redis backups older than 1 day (Redis data is transient)
find "${BACKUP_DIR}/data" -name "redis-*.rdb" -mtime +1 -delete

# Remove log backups older than RETENTION_DAYS
find "${BACKUP_DIR}/logs" -name "*.log" -mtime +$RETENTION_DAYS -delete

log "✅ Backup rotation complete"

# ==========================================
# Step 6: Update Heartbeat
# ==========================================

log "Updating heartbeat..."

redis-cli SET "backup:heartbeat" $(date +%s) > /dev/null
redis-cli EXPIRE "backup:heartbeat" 3600 > /dev/null

# ==========================================
# Summary
# ==========================================

log "Backup completed successfully!"

log "Summary:"
log "  - SQLite: ${BACKUP_DIR}/data/hotel-bot-${TIMESTAMP}.db"
log "  - Redis: ${BACKUP_DIR}/data/redis-${TIMESTAMP}.rdb"
log "  - Logs: ${BACKUP_DIR}/logs/"
log "  - Size: $(du -sh ${BACKUP_DIR} | cut -f1)"

exit 0
