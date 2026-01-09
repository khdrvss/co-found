# 🚀 Quick Start Guide - Docker One-Command Setup

## Prerequisites
✅ Docker Desktop installed and running
- Download from: https://www.docker.com/products/docker-desktop
- Ensure Docker Desktop is running (check system tray)

---

## Start Everything with ONE Command

### Windows (PowerShell):
```powershell
docker-compose up -d
```

### macOS/Linux:
```bash
docker-compose up -d
```

---

## What This Command Does

The single command `docker-compose up -d` will:

1. **Build the Docker image** for the app (frontend + backend)
2. **Start PostgreSQL database** on port 5432
3. **Start the Express backend** on port 5000
4. **Build and serve the frontend** on port 5173 (dev) or 5000 (prod)
5. **Initialize the database** with schema and migrations
6. **Wait for all services** to be healthy before fully starting

All of this happens **automatically with one command**! 🎉

---

## After Starting

### Check if services are running:
```bash
docker-compose ps
```

You should see:
```
NAME              STATUS              PORTS
cofound_db        Up (healthy)        5432/tcp
cofound_app       Up                  0.0.0.0:5000->5000/tcp, 0.0.0.0:5173->5173/tcp
```

### Access the application:
- **Frontend**: http://localhost:5173 (development)
- **Backend API**: http://localhost:5000
- **Database**: postgresql://localhost:5432

### View logs:
```bash
docker-compose logs -f app
```

### Stop everything:
```bash
docker-compose down
```

### Reset everything (if needed):
```bash
docker-compose down -v
docker-compose up -d
```

---

## File Structure

Everything needed is already in the repository:

```
.
├── docker-compose.yml     ← Service definitions
├── Dockerfile             ← Build instructions
├── .env                   ← Configuration (create from .env.example)
├── src/                   ← Source code
├── migrations/            ← Database migrations
└── schema.sql             ← Initial database schema
```

---

## Troubleshooting

### Docker not starting?
- Open Docker Desktop application
- Wait for "Docker Desktop is running" message
- Try the command again

### Port already in use?
```bash
# Find what's using the port
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <PID> /F

# Then try again
docker-compose up -d
```

### Database won't connect?
```bash
# Check database logs
docker-compose logs db

# Rebuild everything
docker-compose down -v
docker-compose up -d --build
```

### Need to see all logs?
```bash
docker-compose logs --tail=100 -f
```

---

## Commands You'll Need

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop everything
docker-compose down

# Restart a service
docker-compose restart app

# Execute command in running container
docker exec cofound_app npm run migrate:optimize

# Access database
docker exec -it cofound_db psql -U postgres -d cofound_prod

# Full reset
docker-compose down -v && docker-compose up -d --build
```

---

## What Gets Started?

| Service | Port | Role |
|---------|------|------|
| **PostgreSQL** | 5432 | Database (internal) |
| **Backend** | 5000 | Express API server |
| **Frontend** | 5173 | Vite development server |

Everything is **containerized** and **isolated** - no local setup needed!

---

## Production Deployment

Once ready for production:

```bash
# Start with SSL/HTTPS and Nginx proxy
docker-compose --profile prod up -d
```

This adds:
- Nginx reverse proxy (load balancer)
- ACME (Let's Encrypt SSL certificates)
- Production optimizations

---

## Next Steps

1. Make sure `.env` file exists (copy from `.env.example`)
2. Run: `docker-compose up -d`
3. Wait 10-15 seconds for services to start
4. Visit: http://localhost:5173
5. Check logs if anything goes wrong: `docker-compose logs -f`

---

**That's it! The entire stack runs with one command. 🐳**
