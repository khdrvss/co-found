#!/bin/bash

# Co-found Local Development Startup Script
# Starts the project locally with SQLite (faster setup)

echo "🚀 Starting Co-found Platform Locally (SQLite Mode)..."
echo ""

# Check if .env file exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local for development..."
    cat > .env.local << EOF
# Local Development Environment
NODE_ENV=development
PORT=5000

# SQLite Database (no PostgreSQL needed)
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Google OAuth (optional - leave empty for now)
VITE_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_ID=

# API URLs
VITE_API_URL=http://localhost:5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Feature flags
ENABLE_RATE_LIMIT=false
EOF
    echo "✅ .env.local created"
fi

# Copy environment
cp .env.local .env

echo "📦 Installing dependencies..."
npm install > /dev/null 2>&1

echo "🗃️  Setting up SQLite database..."
# Update Prisma schema to use SQLite temporarily
if ! grep -q 'provider = "sqlite"' prisma/schema.prisma; then
    sed -i.bak 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
    echo "✅ Updated Prisma schema for SQLite"
fi

# Generate Prisma client
npx prisma generate > /dev/null 2>&1

# Run migrations
npx prisma db push > /dev/null 2>&1
echo "✅ Database setup complete"

echo ""
echo "🌟 Starting Co-found services..."
echo ""

# Start the backend server
echo "🔧 Starting backend server on port 5000..."
npm run server &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start the frontend development server
echo "🎨 Starting frontend development server on port 3000..."
npm run dev &
FRONTEND_PID=$!

# Wait a bit more
sleep 2

echo ""
echo "✨ Co-found is now running!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/api/health"
echo ""
echo "📊 Test the API:"
echo "   curl http://localhost:5000/api/health"
echo ""
echo "⛔ To stop:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or press Ctrl+C to stop this script"
echo ""

# Keep script running
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
