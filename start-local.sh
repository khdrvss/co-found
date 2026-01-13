#!/bin/bash

# Co-found Local Development Startup Script
# This script starts the Co-found platform locally without Docker

echo "🚀 Starting Co-found Platform Locally..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
    echo ""
fi

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if ! pg_isready > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running. Starting it..."
    sudo systemctl start postgresql
    
    if ! pg_isready > /dev/null 2>&1; then
        echo "❌ Could not start PostgreSQL. Please install and configure PostgreSQL:"
        echo "   sudo pacman -S postgresql"
        echo "   sudo -u postgres initdb -D /var/lib/postgres/data"
        echo "   sudo systemctl enable --now postgresql"
        echo "   sudo -u postgres createuser --interactive"
        exit 1
    fi
fi

echo "✅ PostgreSQL is running"

# Check if database exists
DB_NAME="cofound_local"
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "📝 Creating database '$DB_NAME'..."
    sudo -u postgres createdb "$DB_NAME"
    echo "✅ Database created"
fi

# Check if user exists
DB_USER="postgres"
if ! sudo -u postgres psql -t -c '\du' | cut -d \| -f 1 | grep -qw "$DB_USER"; then
    echo "📝 Creating database user '$DB_USER'..."
    sudo -u postgres createuser "$DB_USER" --superuser
    echo "✅ Database user created"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the application
echo ""
echo "🚀 Starting Co-found application..."
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Database: localhost:5432"
echo ""
echo "📋 Use Ctrl+C to stop all services"
echo ""

# Start both frontend and backend
npm run dev
