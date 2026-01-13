#!/bin/bash

echo "🚀 Building Co-found.uz for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend for production
echo "🏗️  Building frontend..."
npm run build

# Create production directories
mkdir -p dist/server
mkdir -p dist/client

# Copy server files to production directory
echo "📂 Copying server files..."
cp -r src/server/* dist/server/
cp package.json dist/
cp .env.production dist/.env

# Build server
echo "🔨 Building server..."
cd dist && npm install --only=production

echo "✅ Build complete! Ready for deployment."
echo ""
echo "📋 Next steps:"
echo "1. Set up your production database"
echo "2. Update .env.production with your production values"  
echo "3. Deploy to your server"
echo "4. Run: npm start"
