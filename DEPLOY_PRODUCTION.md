# Production Deployment Guide for co-found

## Prerequisites

- Ubuntu 24.04 VPS with 7.8 GiB RAM (NO SWAP)
- Docker and docker-compose plugin installed
- Non-root sudo user (e.g., `deploy`)
- Git, curl, ufw installed

## Initial Setup (One-Time)

### 1. Create Project Directory

```bash
sudo mkdir -p /opt/docker/co-found
sudo chown $USER:$USER /opt/docker/co-found
cd /opt/docker/co-found
```

### 2. Clone Repository

```bash
git clone <your-repo-url> .
# OR if already cloned, ensure you're in the right directory
cd /opt/docker/co-found
git pull origin main
```

### 3. Create .env File with Proper Permissions

```bash
# Create .env file (use your preferred editor)
nano .env
# OR
vim .env

# Set permissions to 600 (owner read/write only)
chmod 600 .env
```

**Required .env variables:**
```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-random-password>
POSTGRES_DB=cofound_prod

# Security
JWT_SECRET=<generate-with-openssl-rand-hex-32>
LETSENCRYPT_EMAIL=your-email@example.com

# Application URLs
VITE_API_URL=https://co-found.uz
VITE_FRONTEND_URL=https://co-found.uz

# Optional
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

**Generate JWT_SECRET:**
```bash
openssl rand -hex 32
```

### 4. Build Application Image (On Build Server or CI/CD)

**IMPORTANT:** Images must be pre-built. Never use `--build` in production.

```bash
# On your build server/CI:
docker build -t co-found-app:1.0.0 -f Dockerfile .

# Push to registry (if using one):
docker tag co-found-app:1.0.0 registry.example.com/co-found-app:1.0.0
docker push registry.example.com/co-found-app:1.0.0

# OR save as tar and transfer to VPS:
docker save co-found-app:1.0.0 | gzip > co-found-app-1.0.0.tar.gz
# Transfer to VPS, then:
docker load < co-found-app-1.0.0.tar.gz
```

**Update docker-compose.prod.yml:**
```bash
# Edit the app service image tag to match your version
sed -i 's/co-found-app:.*/co-found-app:1.0.0/' docker-compose.prod.yml
```

## Deployment Commands

### First-Time Deployment

```bash
cd /opt/docker/co-found

# 1. Validate compose file
docker compose -f docker-compose.prod.yml config

# 2. Pull required images (if using registry)
docker compose -f docker-compose.prod.yml pull

# 3. Create named volumes (if they don't exist)
docker volume create co-found-postgres-data
docker volume create co-found-redis-data
docker volume create co-found-app-uploads
docker volume create co-found-traefik-acme

# 4. Start services
docker compose -f docker-compose.prod.yml up -d

# 5. Verify all services are healthy
docker compose -f docker-compose.prod.yml ps

# 6. Check logs
docker compose -f docker-compose.prod.yml logs -f
```

### Verify Deployment

```bash
# Check service status
docker compose -f docker-compose.prod.yml ps

# Check resource usage
docker stats

# Test health endpoint (from within network)
docker compose -f docker-compose.prod.yml exec app curl http://localhost:5000/api/health

# Check logs for errors
docker compose -f docker-compose.prod.yml logs app | tail -50
docker compose -f docker-compose.prod.yml logs db | tail -50
docker compose -f docker-compose.prod.yml logs redis | tail -50
docker compose -f docker-compose.prod.yml logs traefik | tail -50
```

## Update Procedure (Never Mutate Containers In-Place)

### Update Application (New Image Version)

```bash
cd /opt/docker/co-found

# 1. Pull latest code (if needed)
git pull origin main

# 2. Load new image (if transferred as tar)
docker load < co-found-app-1.1.0.tar.gz

# OR pull from registry
docker pull registry.example.com/co-found-app:1.1.0
docker tag registry.example.com/co-found-app:1.1.0 co-found-app:1.1.0

# 3. Update image tag in docker-compose.prod.yml
sed -i 's/co-found-app:.*/co-found-app:1.1.0/' docker-compose.prod.yml

# 4. Stop and remove old container (preserves volumes)
docker compose -f docker-compose.prod.yml stop app
docker compose -f docker-compose.prod.yml rm -f app

# 5. Start new container with updated image
docker compose -f docker-compose.prod.yml up -d app

# 6. Verify new container is healthy
docker compose -f docker-compose.prod.yml ps app
docker compose -f docker-compose.prod.yml logs -f app
```

### Update Infrastructure Services (PostgreSQL, Redis, Traefik)

```bash
cd /opt/docker/co-found

# 1. Update image versions in docker-compose.prod.yml
# Example: postgres:15-alpine -> postgres:16-alpine

# 2. Pull new images
docker compose -f docker-compose.prod.yml pull db redis traefik

# 3. Stop service
docker compose -f docker-compose.prod.yml stop <service-name>

# 4. Remove old container
docker compose -f docker-compose.prod.yml rm -f <service-name>

# 5. Start new container
docker compose -f docker-compose.prod.yml up -d <service-name>

# 6. Verify health
docker compose -f docker-compose.prod.yml ps <service-name>
```

## Maintenance Commands

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f app

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 app
```

### Check Resource Usage

```bash
# Real-time stats
docker stats

# Compose service status
docker compose -f docker-compose.prod.yml ps

# Memory usage per service
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

### Backup Database

```bash
# Create backup
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres cofound_prod > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore backup
docker compose -f docker-compose.prod.yml exec -T db psql -U postgres cofound_prod < backup-YYYYMMDD-HHMMSS.sql
```

### Clean Up

```bash
# Remove stopped containers
docker compose -f docker-compose.prod.yml rm -f

# Remove unused images (careful - only after confirming)
docker image prune -a

# View disk usage
docker system df
```

## Emergency Procedures

### Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs <service-name>

# Check if port is already in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Check memory
free -h
docker stats --no-stream
```

### Container Restarting Continuously

```bash
# Check logs for crash reason
docker compose -f docker-compose.prod.yml logs --tail=200 <service-name>

# Check healthcheck status
docker inspect <container-name> | grep -A 10 Health

# Temporarily disable healthcheck to debug
# Edit docker-compose.prod.yml, comment out healthcheck, recreate
```

### Out of Memory

```bash
# Check current usage
docker stats --no-stream

# Reduce memory limits in docker-compose.prod.yml if needed
# Then recreate services:
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

## Security Checklist

- [ ] `.env` file has 600 permissions
- [ ] All images are version-pinned (no `:latest`)
- [ ] No host ports exposed except Traefik (80/443)
- [ ] All volumes are named (no anonymous volumes)
- [ ] Logging is bounded (10m × 3 files per service)
- [ ] Memory limits set (total ≤ 4.7 GiB)
- [ ] All services have healthchecks
- [ ] Restart policy is `unless-stopped`
- [ ] Private network in use (not default bridge)
- [ ] Docker socket mount is read-only (ro)

## Troubleshooting

### Permission Denied on /opt/docker

```bash
sudo chown -R $USER:$USER /opt/docker/co-found
```

### Cannot Connect to Database

```bash
# Check if db is healthy
docker compose -f docker-compose.prod.yml ps db

# Test connection from app container
docker compose -f docker-compose.prod.yml exec app sh -c "nc -z db 5432 && echo 'Connection OK'"
```

### Traefik Not Routing

```bash
# Check Traefik logs
docker compose -f docker-compose.prod.yml logs traefik

# Verify labels on app container
docker inspect co-found-app | grep -A 20 Labels

# Check Traefik dashboard (if enabled on port 8080)
curl http://localhost:8080/api/http/routers
```

### Memory Exhaustion

```bash
# Check system memory
free -h

# Check container memory usage
docker stats --no-stream

# Reduce limits if needed and recreate
docker compose -f docker-compose.prod.yml up -d --force-recreate
```
