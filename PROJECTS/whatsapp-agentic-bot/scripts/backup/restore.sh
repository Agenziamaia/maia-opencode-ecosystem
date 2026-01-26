#!/bin/bash

# ==========================================
# Restore Script
# Used to restore from backups (Mac or VPS)
# ==========================================

set -e

# Configuration
PROJECT_DIR="/Users/g/Desktop/MAIA opencode/whatsapp-agentic-bot"
BACKUP_DIR="${PROJECT_DIR}/backups"
LOG_FILE="${PROJECT_DIR}/logs/restore.log"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Parse arguments
BACKUP_TYPE="${1:-local}"
BACKUP_DATE="${2:-latest}"

if [ "$BACKUP_TYPE" != "local" ] && [ "$BACKUP_TYPE" != "vps" ]; then
    log "❌ Invalid backup type: $BACKUP_TYPE (use 'local' or 'vps')"
    exit 1
fi

log "Starting restore from $BACKUP_TYPE backup..."

# ==========================================
# Step 1: Stop Services
# ==========================================

log "Stopping services..."

# Stop the bot
launchctl unload ~/Library/LaunchAgents/com.hotelbot.whatsapp-agentic-bot.plist 2>/dev/null || true

# Stop Redis
redis-cli SHUTDOWN 2>/dev/null || true

# Wait for services to stop
sleep 3

log "✅ Services stopped"

# ==========================================
# Step 2: Select Backup
# ==========================================

if [ "$BACKUP_TYPE" = "local" ]; then
    log "Using local backup..."

    if [ "$BACKUP_DATE" = "latest" ]; then
        DB_BACKUP=$(ls -t ${BACKUP_DIR}/data/hotel-bot-*.db 2>/dev/null | head -1)
        REDIS_BACKUP=$(ls -t ${BACKUP_DIR}/data/redis-*.rdb 2>/dev/null | head -1)
    else
        DB_BACKUP="${BACKUP_DIR}/data/hotel-bot-${BACKUP_DATE}.db"
        REDIS_BACKUP="${BACKUP_DIR}/data/redis-${BACKUP_DATE}.rdb"
    fi
else
    log "Using VPS backup..."

    if [ -z "$BACKUP_VPS_HOST" ] || [ -z "$BACKUP_VPS_USER" ]; then
        log "❌ VPS not configured!"
        exit 1
    fi

    # Download from VPS
    REMOTE_BACKUP_DIR="/backups/data"

    if [ "$BACKUP_DATE" = "latest" ]; then
        # Find latest backup on VPS
        LATEST_DB=$(ssh "${BACKUP_VPS_USER}@${BACKUP_VPS_HOST}" "ls -t ${REMOTE_BACKUP_DIR}/hotel-bot-*.db 2>/dev/null | head -1")
        LATEST_REDIS=$(ssh "${BACKUP_VPS_USER}@${BACKUP_VPS_HOST}" "ls -t ${REMOTE_BACKUP_DIR}/redis-*.rdb 2>/dev/null | head -1")

        DB_BACKUP="${BACKUP_DIR}/data/$(basename $LATEST_DB)"
        REDIS_BACKUP="${BACKUP_DIR}/data/$(basename $LATEST_REDIS)"
    else
        DB_BACKUP="${BACKUP_DIR}/data/hotel-bot-${BACKUP_DATE}.db"
        REDIS_BACKUP="${BACKUP_DIR}/data/redis-${BACKUP_DATE}.rdb"
    fi

    # Download backups
    log "Downloading backups from VPS..."
    rsync -avz "${BACKUP_VPS_USER}@${BACKUP_VPS_HOST}:${LATEST_DB}" "${BACKUP_DIR}/data/"
    rsync -avz "${BACKUP_VPS_USER}@${BACKUP_VPS_HOST}:${LATEST_REDIS}" "${BACKUP_DIR}/data/"
fi

# Verify backups exist
if [ ! -f "$DB_BACKUP" ]; then
    log "❌ Database backup not found: $DB_BACKUP"
    exit 1
fi

if [ ! -f "$REDIS_BACKUP" ]; then
    log "❌ Redis backup not found: $REDIS_BACKUP"
    exit 1
fi

log "✅ Backups found:"
log "  - SQLite: $DB_BACKUP"
log "  - Redis: $REDIS_BACKUP"

# ==========================================
# Step 3: Restore SQLite
# ==========================================

log "Restoring SQLite database..."

DB_PATH="${PROJECT_DIR}/data/hotel-bot.db"

# Backup current database (just in case)
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "${DB_PATH}.pre-restore-$(date +%Y%m%d_%H%M%S)"
    log "✅ Current database backed up"
fi

# Restore database
cp "$DB_BACKUP" "$DB_PATH"

# Verify integrity
sqlite3 "$DB_PATH" "PRAGMA integrity_check;" > /dev/null

if [ $? -eq 0 ]; then
    log "✅ SQLite restore successful"
else
    log "❌ SQLite integrity check failed!"
    exit 1
fi

# ==========================================
# Step 4: Restore Redis
# ==========================================

log "Restoring Redis..."

REDIS_RDB="/usr/local/var/db/redis/dump.rdb"

# Backup current RDB
if [ -f "$REDIS_RDB" ]; then
    cp "$REDIS_RDB" "${REDIS_RDB}.pre-restore-$(date +%Y%m%d_%H%M%S)"
    log "✅ Current RDB backed up"
fi

# Restore RDB
cp "$REDIS_BACKUP" "$REDIS_RDB"

log "✅ Redis restore successful"

# ==========================================
# Step 5: Start Services
# ==========================================

log "Starting services..."

# Start Redis
brew services start redis

# Wait for Redis to start
sleep 2

# Verify Redis
redis-cli ping > /dev/null

if [ $? -eq 0 ]; then
    log "✅ Redis started"
else
    log "❌ Redis failed to start!"
    exit 1
fi

# Start bot
launchctl load ~/Library/LaunchAgents/com.hotelbot.whatsapp-agentic-bot.plist

# Wait for bot to start
sleep 3

# Verify bot
curl -s http://localhost:3000/health > /dev/null

if [ $? -eq 0 ]; then
    log "✅ Bot started"
else
    log "❌ Bot failed to start!"
    exit 1
fi

# ==========================================
# Step 6: Replay Queued Messages
# ==========================================

log "Checking for queued messages..."

# Get queue depth
QUEUED=$(redis-cli LLEN "bull:whatsapp-messages:waiting" 2>/dev/null || echo 0)

if [ "$QUEUED" -gt 0 ]; then
    log "⚠️ Found $QUEUED queued messages"
    log "These will be processed automatically by workers"
else
    log "✅ No queued messages"
fi

# ==========================================
# Summary
# ==========================================

log "Restore completed successfully!"

log "Summary:"
log "  - Database: $DB_BACKUP"
log "  - Redis: $REDIS_BACKUP"
log "  - Queued messages: $QUEUED"
log "  - Services: Running"

log "✨ System is ready!"

exit 0
