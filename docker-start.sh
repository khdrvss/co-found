#!/bin/bash

# Co-fo# Build and st# Check container status
echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "🌐 Access Points:"
echo "   Frontend & API: http://localhost:5000"
echo "   Database: localhost:5432"
echo "   Health Check: http://localhost:5000/api/health"

echo ""
echo "📋 Useful Commands:"
echo "   View logs:     docker compose logs -f"
echo "   Stop:          docker compose down"
echo "   Restart:       docker compose restart"cho "🔨 Building and starting Docker containers..."
docker compose down 2>/dev/null || true
docker compose build --no-cache
docker compose up -docker Startup Script
# This script starts the entire Co-found platform with Docker

echo "🐳 Starting Co-found Platform with Docker..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
    echo "📝 Key variables to update:"
    echo "   - JWT_SECRET (change from default)"
    echo "   - VITE_GOOGLE_CLIENT_ID (for Google OAuth)"
    echo "   - POSTGRES_PASSWORD (for security)"
    echo ""
fi

# Build and start containers
echo "� Building and starting Docker containers..."
docker-compose down 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Check container status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🌐 Access Points:"
echo "   Frontend & API: http://localhost:5000"
echo "   Database: localhost:5432"
echo "   Health Check: http://localhost:5000/api/health"

echo ""
echo "� Useful Commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop:          docker-compose down"
echo "   Restart:       docker-compose restart"
echo "   Database CLI:  docker exec -it cofound_db psql -U postgres -d cofound_prod"

echo ""
echo "✨ Co-found is now running! Visit http://localhost:5000"
