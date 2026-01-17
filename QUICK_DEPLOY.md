# Quick Deployment Reference

## Exact Commands for VPS Deployment

### Initial Setup (Run Once)

```bash
# 1. Create project directory
sudo mkdir -p /opt/docker/co-found
sudo chown $USER:$USER /opt/docker/co-found
cd /opt/docker/co-found

# 2. Clone repository
git clone <your-repo-url> .
# OR if already exists:
cd /opt/docker/co-found && git pull

# 3. Create .env file with 600 permissions
cat > .env << 'EOF'
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_DB=cofound_prod
JWT_SECRET=$(openssl rand -hex 32)
LETSENCRYPT_EMAIL=your-email@example.com
VITE_API_URL=https://co-found.uz
VITE_FRONTEND_URL=https://co-found.uz
VITE_GOOGLE_CLIENT_ID=your-client-id-here
EOF

# Generate actual random values
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -hex 32)
sed -i "s/\$(openssl rand -base64 32)/$POSTGRES_PASSWORD/" .env
sed -i "s/\$(openssl rand -hex 32)/$JWT_SECRET/" .env
sed -i "s/your-email@example.com/your-actual-email@example.com/" .env

# Set permissions
chmod 600 .env

# 4. Build and load app image (on build server, then transfer)
# On build server:
docker build -t co-found-app:1.0.0 -f Dockerfile .
docker save co-found-app:1.0.0 | gzip > co-found-app-1.0.0.tar.gz

# Transfer to VPS, then load:
docker load < co-found-app-1.0.0.tar.gz

# 5. Update image tag in docker-compose.prod.yml
sed -i 's/co-found-app:.*/co-found-app:1.0.0/' docker-compose.prod.yml
```

### Deploy Application

```bash
cd /opt/docker/co-found

# Validate configuration
docker compose -f docker-compose.prod.yml config

# Create volumes
docker volume create co-found-postgres-data
docker volume create co-found-redis-data
docker volume create co-found-app-uploads
docker volume create co-found-traefik-acme

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Verify status
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

### Update Application (New Version)

```bash
cd /opt/docker/co-found

# 1. Load new image
docker load < co-found-app-1.1.0.tar.gz

# 2. Update image tag
sed -i 's/co-found-app:.*/co-found-app:1.1.0/' docker-compose.prod.yml

# 3. Stop and remove old container
docker compose -f docker-compose.prod.yml stop app
docker compose -f docker-compose.prod.yml rm -f app

# 4. Start new container
docker compose -f docker-compose.prod.yml up -d app

# 5. Verify
docker compose -f docker-compose.prod.yml ps app
docker compose -f docker-compose.prod.yml logs -f app
```

### Daily Operations

```bash
# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f app

# Check resource usage
docker stats --no-stream

# Backup database
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres cofound_prod > backup-$(date +%Y%m%d).sql

# Restart service
docker compose -f docker-compose.prod.yml restart app
```

### Using Deployment Script

```bash
cd /opt/docker/co-found
chmod +x deploy.sh

# Deploy
./deploy.sh deploy

# Check status
./deploy.sh status

# View logs
./deploy.sh logs app

# Update service
./deploy.sh update app

# Backup database
./deploy.sh backup
```

## Important Notes

1. **Never use `--build` in production** - images must be pre-built
2. **Always update image tag** in docker-compose.prod.yml before updating
3. **Never mutate containers** - always stop, remove, recreate
4. **Check .env permissions** - must be 600
5. **Monitor memory** - total must stay under 4.7 GiB
6. **All volumes are named** - no anonymous volumes
7. **No host ports** except Traefik (80/443)
