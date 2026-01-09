@echo off
REM Start all services with Docker Compose for Windows
REM Usage: docker-start.bat [dev|prod]

setlocal enabledelayedexpansion

set MODE=%1
if "%MODE%"=="" set MODE=dev

echo.
echo 🐳 Starting Co-Found with Docker (%MODE% mode^)...
echo.

if /i "%MODE%"=="prod" (
  echo 📦 Production Mode: Starting with SSL and Nginx proxy...
  docker-compose --profile prod up -d
) else (
  echo 🔧 Development Mode: Starting services...
  docker-compose up -d
)

echo.
echo ⏳ Waiting for services to start...
timeout /t 5 /nobreak

echo.
echo 📊 Service Status:
docker-compose ps

if /i "%MODE%"=="prod" (
  echo.
  echo ✅ Production setup running
  echo    - Access via: http://localhost or https://yourdomain.com
  echo    - Database: Not exposed (internal)
) else (
  echo.
  echo ✅ Development setup running
  echo    - Database: postgresql://localhost:5432
  echo    - Backend API: http://localhost:5000
  echo    - Frontend: http://localhost:5173 (Vite dev)
  echo.
  echo 📝 Setting up database optimization...
  docker exec cofound_app npm run migrate:optimize || echo Warning: Database optimization skipped
)

echo.
echo 💡 Useful commands:
echo    - View logs: docker-compose logs -f app
echo    - Stop all: docker-compose down
echo    - Restart: docker-compose restart
echo    - Clean up: docker-compose down -v
echo.
