#!/bin/bash
# Launchd Setup Script for WhatsApp Agentic Bot

set -e

PLIST_FILE="com.hotelbot.whatsapp-agentic-bot.plist"
TARGET_DIR="$HOME/Library/LaunchAgents"
TARGET_PATH="$TARGET_DIR/$PLIST_FILE"
PROJECT_DIR=$(pwd)

echo "🚀 Setting up launchd service..."
echo "================================"

# Build the project first
echo "📦 Building project..."
npm run build

# Get absolute path to node
NODE_PATH=$(which node)
echo "📍 Node.js path: $NODE_PATH"

# Create launchd plist with absolute paths
cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.hotelbot.whatsapp-agentic-bot</string>

    <key>ProgramArguments</key>
    <array>
        <string>$NODE_PATH</string>
        <string>$PROJECT_DIR/dist/index.js</string>
    </array>

    <key>WorkingDirectory</key>
    <string>$PROJECT_DIR</string>

    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/launchd-stdout.log</string>

    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/launchd-stderr.log</string>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin</string>
        <key>NODE_ENV</key>
        <string>production</string>
    </dict>
</dict>
</plist>
EOF

# Copy to LaunchAgents
echo "📋 Installing launchd service..."
mkdir -p "$TARGET_DIR"
cp "$PLIST_FILE" "$TARGET_PATH"

# Load the service
echo "🔄 Loading launchd service..."
launchctl unload "$TARGET_PATH" 2>/dev/null || true
launchctl load "$TARGET_PATH"

# Start the service
echo "▶️  Starting service..."
launchctl start "com.hotelbot.whatsapp-agentic-bot"

echo ""
echo "✅ Launchd service installed and started!"
echo ""
echo "Service management commands:"
echo "  Status:   launchctl list | grep whatsapp-agentic-bot"
echo "  Stop:      launchctl stop com.hotelbot.whatsapp-agentic-bot"
echo "  Start:     launchctl start com.hotelbot.whatsapp-agentic-bot"
echo "  Restart:   launchctl kickstart -k gui/\$(id -u)/com.hotelbot.whatsapp-agentic-bot"
echo ""
echo "Logs:"
echo "  App:       tail -f logs/app.log"
echo "  Launchd:   tail -f logs/launchd-stdout.log"
echo "  Errors:    tail -f logs/launchd-stderr.log"
echo ""
