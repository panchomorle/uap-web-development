#!/bin/bash

# Development setup script for the Faucet DApp backend

echo "🚀 Setting up Faucet DApp Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual values before starting the server!"
    echo "   - PRIVATE_KEY: Your Ethereum private key"
    echo "   - JWT_SECRET: A long, random string"
else
    echo "✅ .env file already exists"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Backend will be available at http://localhost:3001"
echo ""
echo "📚 API Documentation available in README.md"
