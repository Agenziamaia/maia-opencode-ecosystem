#!/bin/bash

# OPS: Bootstrap Script - Install and configure WhatsApp Agentic Bot
# Role: One-command setup for macOS environment

set -e

echo "🚀 Setting up WhatsApp Agentic Bot..."

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null || echo "none")
if [ "$NODE_VERSION" = "none" ]; then
    echo "❌ Node.js not found. Please install Node.js 20+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️ Warning: This script is optimized for macOS."
fi

# Install Homebrew if not present (macOS)
if [[ "$OSTYPE" == "darwin"* ]] && ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install Redis if not present
if ! command -v redis-cli &> /dev/null; then
    echo "📦 Installing Redis..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install redis
    else
        echo "❌ Please install Redis manually for your OS."
        exit 1
    fi
fi

# Start Redis
echo "🚀 Starting Redis..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start redis || true
else
    redis-server --daemonize yes || true
fi

# Install Node dependencies
echo "📦 Installing Node dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs data

# Copy environment file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️ Please edit .env with your API keys and configuration."
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Initialize database
echo "💾 Initializing database..."
npm run db:migrate

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env with your API keys:"
echo "      - SPOKI_API_KEY (WhatsApp)"
echo "      - SMOBU_API_KEY (Property management)"
echo "      - OPENAI_API_KEY (Concierge Q&A)"
echo "      - EMAIL_* (IMAP/SMTP credentials)"
echo ""
echo "   2. Start the development server:"
echo "      npm run dev"
echo ""
echo "   3. Or start in production mode (24/7):"
echo "      npm run setup-launchd"
echo ""
echo "📚 Documentation: README.md"
