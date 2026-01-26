#!/bin/bash
# Setup script for WhatsApp Agentic Bot

set -e

echo "🤖 WhatsApp Agentic Bot - Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis is not installed. Installing with Homebrew..."
    if command -v brew &> /dev/null; then
        brew install redis
    else
        echo "❌ Please install Redis manually or install Homebrew first."
        exit 1
    fi
fi

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Create data directory
echo "📁 Creating data directory..."
mkdir -p data
mkdir -p logs

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and fill in your credentials!"
else
    echo "✅ .env file already exists"
fi

# Start Redis
echo "🚀 Starting Redis..."
if brew services list | grep redis | grep started > /dev/null; then
    echo "✅ Redis is already running"
else
    brew services start redis
    echo "✅ Redis started"
fi

# Initialize database
echo "🗄️  Initializing database..."
npm run db:migrate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and fill in your credentials"
echo "2. Run 'npm run dev' to start the bot in development mode"
echo "3. Run 'bash scripts/setup-launchd.sh' to set up 24/7 service"
echo ""
