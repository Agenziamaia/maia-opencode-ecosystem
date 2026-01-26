#!/bin/bash

# OPS: Launchd Setup Script - Install and manage 24/7 service
# Role: Configure macOS launchd for automatic startup and restart

PLIST_FILE="com.hotelbot.whatsapp-agentic-bot.plist"
LAUNCHD_DIR="$HOME/Library/LaunchAgents"
FULL_PATH="$LAUNCHD_DIR/$PLIST_FILE"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 Setting up launchd for 24/7 operation..."

# Update plist with actual path
sed "s|/Users/g/Desktop/MAIA opencode/whatsapp-agentic-bot|$SCRIPT_DIR|g" "$SCRIPT_DIR/$PLIST_FILE" > /tmp/$PLIST_FILE

# Copy to LaunchAgents
echo "📋 Installing launchd plist..."
mkdir -p "$LAUNCHD_DIR"
cp /tmp/$PLIST_FILE "$FULL_PATH"

# Unload if already loaded
if launchctl list | grep -q "com.hotelbot.whatsapp-agentic-bot"; then
    echo "🛑 Unloading existing service..."
    launchctl unload "$FULL_PATH" 2>/dev/null || true
fi

# Load service
echo "🚀 Loading service..."
launchctl load "$FULL_PATH"

# Wait a moment
sleep 2

# Check status
if launchctl list | grep -q "com.hotelbot.whatsapp-agentic-bot"; then
    echo "✅ Service is running!"
    echo ""
    echo "📊 Service status:"
    launchctl list | grep "com.hotelbot.whatsapp-agentic-bot"
    echo ""
    echo "📝 Available commands:"
    echo "   - Stop service:   launchctl unload $FULL_PATH"
    echo "   - Start service:  launchctl load $FULL_PATH"
    echo "   - Restart:        launchctl kickstart -k gui/$(id -u)/com.hotelbot.whatsapp-agentic-bot"
    echo "   - View logs:      tail -f $SCRIPT_DIR/logs/launchd-stdout.log"
    echo "   - View errors:    tail -f $SCRIPT_DIR/logs/launchd-stderr.log"
else
    echo "❌ Failed to start service"
    echo "Check logs: $SCRIPT_DIR/logs/launchd-stderr.log"
    exit 1
fi

# Cleanup
rm /tmp/$PLIST_FILE
