# 🐳 Docker Setup Guide

Run the entire Co-Found project with **one command** using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed (includes Docker and Docker Compose)
- `.env` file configured (copy from `.env.example` and update values)

## Quick Start (Development)

### On macOS/Linux:
```bash
./docker-start.sh dev
```

### On Windows (PowerShell):
```powershell
.\docker-start.bat dev
```

### Or use docker-compose directly:
```bash
docker-compose up -d
```

**That's it!** Everything runs in Docker:
- 🗄️ PostgreSQL database (port 5432)
- 🚀 Backend API (port 5000)
- ⚛️ Frontend Vite dev server (port 5173)

---

## What Gets Started

### Development Mode (default)
```
docker-compose up -d
```

Starts 2 services:
| Service | URL | Port |
|---------|-----|------|
| **Database** | `postgresql://localhost:5432` | 5432 |
| **App** (Backend + Frontend) | `http://localhost:5000` | 5000 |
| **Vite Dev Server** | `http://localhost:5173` | 5173 |

### Production Mode
```
docker-compose --profile prod up -d
```

Starts 4 services:
| Service | URL | Features |
|---------|-----|----------|
| **Database** | Internal (not exposed) | PostgreSQL 15 |
| **App** | `http://localhost` | Backend + Frontend |
| **Nginx Proxy** | Port 80/443 | Load balancing, SSL |
| **ACME** | Auto SSL | Let's Encrypt certificates |

---

## Common Commands

### Start Services
```bash
# Development
docker-compose up -d

# Production with SSL
docker-compose --profile prod up -d

# With logs visible
docker-compose up
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100
```

### Stop Services
```bash
# Stop (keeps data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

### Restart/Rebuild
```bash
# Restart one service
docker-compose restart app

# Rebuild image and restart
docker-compose up -d --build

# Full clean rebuild
docker-compose down -v
docker-compose up -d --build
```

### Database Access
```bash
# Connect to PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/cofound_prod

# Or via Docker
docker exec -it cofound_db psql -U postgres -d cofound_prod

# View migrations
docker exec cofound_db ls -la /docker-entrypoint-initdb.d/
```

### Execute Commands in Container
```bash
# Run npm commands
docker exec cofound_app npm run build
docker exec cofound_app npm run migrate:optimize

# Run TypeScript
docker exec cofound_app tsx ./optimize-db.ts

# Shell access
docker exec -it cofound_app sh
```

### Clean Up
```bash
# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a
```

---

## Environment Variables

All configuration comes from `.env` file. Key variables:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=cofound_prod
DATABASE_URL=postgresql://postgres:postgres@db:5432/cofound_prod

# Server
NODE_ENV=production
JWT_SECRET=your-secret-key-change-in-production
PORT=5000

# Security
ENABLE_RATE_LIMIT=true
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:5173

# APIs
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5000
```

### Update Environment
1. Edit `.env` file
2. Restart containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

## Development Workflow

### Hot Reload Development
```bash
docker-compose up -d
docker-compose logs -f app
```

The app watches for changes and rebuilds automatically.

### Add Dependencies
```bash
# Add to package.json, then rebuild
docker-compose down
docker-compose up -d --build
```

### Database Optimization
```bash
# Run inside container
docker exec cofound_app npm run migrate:optimize
```

### Seed Database
```bash
docker exec cofound_app npm run seed
```

---

## Troubleshooting

### Services Won't Start
```bash
# Check for port conflicts
docker-compose down
docker ps  # Check for lingering containers
docker-compose up -d --build
```

### Database Connection Issues
```bash
# Check database is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Test connection
docker exec cofound_db pg_isready
```

### Port Already in Use
```bash
# Change in docker-compose.yml
# Or kill the process
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows
```

### Frontend Not Loading
```bash
# Check app is running
docker exec cofound_app curl http://localhost:5000

# Check logs
docker-compose logs app

# Rebuild
docker-compose up -d --build
```

### Stuck or Corrupted Database
```bash
# Full reset
docker-compose down -v
docker-compose up -d
```

---

## Performance Tips

### Reduce Image Size
- Remove dev dependencies in production
- Use multi-stage builds (already implemented)
- Prune unused images

### Speed Up Builds
- Use `.dockerignore` to exclude unnecessary files
- Leverage layer caching with proper Dockerfile structure
- Install dependencies before copying source code

### Monitor Resources
```bash
# Watch Docker stats
docker stats

# Check image sizes
docker images

# Analyze layers
docker history cofound_app
```

---

## Production Deployment

### On VPS/Server
```bash
# Pull latest
git pull origin main

# Start with SSL
docker-compose --profile prod up -d

# Verify
docker-compose ps
docker-compose logs app
```

### Health Checks
```bash
# API health
curl http://localhost:5000/api/health

# Database
docker exec cofound_db pg_isready

# All services
docker-compose ps
```

### Backup Database
```bash
# Backup
docker exec cofound_db pg_dump -U postgres cofound_prod > backup.sql

# Restore
docker exec -i cofound_db psql -U postgres cofound_prod < backup.sql
```

---

## Architecture

```
┌─────────────────────────────────────┐
│      Browser (Client)               │
└────────────┬────────────────────────┘
             │
             ▼
     ┌──────────────────┐
     │  Nginx Proxy     │  (prod only)
     │  (80, 443)       │
     └────────┬─────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌─────────────┐    ┌──────────────────┐
│  Frontend   │    │  Backend (Node)  │
│  (Vite)     │◄──►│  (Express)       │
│  Port 5173  │    │  Port 5000       │
└─────────────┘    └────────┬─────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │   Port 5432      │
                    │   (Docker only)  │
                    └──────────────────┘
```

---

## Tips & Tricks

### Quick Database Reset
```bash
docker-compose exec db dropdb -U postgres cofound_prod
docker-compose exec db createdb -U postgres cofound_prod
```

### View All Container Names
```bash
docker-compose ps --services
```

### Export Database
```bash
docker-compose exec db pg_dump -U postgres cofound_prod | gzip > backup.sql.gz
```

### Update Base Images
```bash
docker-compose pull
docker-compose up -d --build
```

---

## File Structure

```
.
├── docker-compose.yml      # Service definitions
├── Dockerfile              # Image build instructions
├── docker-start.sh         # Start script (macOS/Linux)
├── docker-start.bat        # Start script (Windows)
├── .env                    # Environment variables (not in git)
├── .env.example            # Template for .env
├── src/
│   └── server/
│       ├── index.ts        # Express app
│       ├── routes.ts       # API routes
│       ├── db.ts           # Database connection
│       └── ...
├── migrations/             # Database migrations
├── schema.sql              # Initial schema
└── package.json            # Dependencies
```

---

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify .env: `docker-compose config`
3. Test services: `docker-compose ps`
4. Reset if needed: `docker-compose down -v && docker-compose up -d --build`

---

**Now you can run the entire project with one command! 🚀**
