#!/bin/bash

# Start all services with Docker Compose
# Usage: ./docker-start.sh [dev|prod]

set -e

MODE=${1:-dev}

echo "🐳 Starting Co-Found with Docker ($MODE mode)..."
echo ""

if [ "$MODE" = "prod" ]; then
  echo "📦 Production Mode: Starting with SSL and Nginx proxy..."
  docker-compose --profile prod up -d
  echo ""
  echo "✅ Services starting..."
  echo "   - Database: postgresql://localhost:5432"
  echo "   - Backend: http://localhost (via Nginx proxy)"
  echo "   - Frontend: http://localhost (via Nginx proxy)"
else
  echo "🔧 Development Mode: Starting services..."
  docker-compose up -d
  echo ""
  echo "✅ Services starting..."
  echo "   - Database: postgresql://localhost:5432"
  echo "   - Backend: http://localhost:5000"
  echo "   - Frontend: http://localhost:5173 (Vite dev server will be available)"
  echo ""
  echo "📝 Checking database..."
  sleep 5
  docker exec cofound_app npm run migrate:optimize || true
fi

echo ""
echo "📊 Checking status..."
docker-compose ps
echo ""
echo "💡 View logs: docker-compose logs -f app"
echo "⛔ Stop services: docker-compose down"
echo "🔄 Restart services: docker-compose restart"
