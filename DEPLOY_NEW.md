# 🚀 Deployment Guide

Complete guide for deploying Co-found.uz to production.

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker & Docker Compose
- Domain name (optional)
- SSL certificate (for HTTPS)

### Quick Deploy
```bash
# Clone repository
git clone https://github.com/khdrvss/co-found.git
cd co-found

# Setup environment
cp .env.example .env
# Edit .env with production values

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Environment Configuration
```bash
# Production Environment Variables
NODE_ENV=production
PORT=5000

# Database (use managed service in production)
DATABASE_URL=postgresql://user:pass@db.example.com:5432/cofound_prod
DB_HOST=db.example.com
DB_PORT=5432
DB_NAME=cofound_prod
DB_USER=cofound_user
DB_PASSWORD=secure-password

# JWT (use strong random string)
JWT_SECRET=super-secure-jwt-secret-key-change-this
JWT_EXPIRES_IN=7d

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com

# Security
ENABLE_RATE_LIMIT=true
CORS_ALLOWED_ORIGINS=https://co-found.uz,https://www.co-found.uz

# API URLs
API_URL=https://api.co-found.uz
FRONTEND_URL=https://co-found.uz
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Monitoring setup
- [ ] Log aggregation configured
- [ ] Health checks enabled

## 🌐 Cloud Platform Deployment

### AWS ECS/Fargate
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t co-found .
docker tag co-found:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/co-found:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/co-found:latest

# Deploy with ECS task definition
```

### Vercel (Frontend Only)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Railway
```bash
# Connect GitHub repository
# Set environment variables
# Deploy automatically on push
```

### DigitalOcean App Platform
```yaml
# app.yaml
name: co-found
services:
- name: web
  source_dir: /
  github:
    repo: khdrvss/co-found
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
databases:
- engine: PG
  name: db
  num_nodes: 1
  size: basic-xs
  version: "15"
```

## 🔧 Manual Server Deployment

### Ubuntu/Debian Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2
npm install -g pm2

# Clone and setup
git clone https://github.com/khdrvss/co-found.git
cd co-found
npm install
npm run build

# Setup database
sudo -u postgres createuser cofound_user
sudo -u postgres createdb cofound_prod
sudo -u postgres psql -c "ALTER USER cofound_user PASSWORD 'secure_password';"

# Configure environment
cp .env.example .env
# Edit .env file

# Start with PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/co-found
server {
    listen 80;
    server_name co-found.uz www.co-found.uz;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name co-found.uz www.co-found.uz;

    ssl_certificate /etc/letsencrypt/live/co-found.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/co-found.uz/privkey.pem;

    # Frontend
    location / {
        root /var/www/co-found/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Application health
curl https://co-found.uz/api/health

# Database connectivity
docker exec co-found-db pg_isready -U postgres

# Container status
docker-compose ps
```

### Log Management
```bash
# View logs
docker-compose logs -f web
docker-compose logs -f db

# Log rotation (add to crontab)
0 0 * * * docker system prune -f
```

### Backup Strategy
```bash
#!/bin/bash
# backup.sh
DATE=$(date +"%Y%m%d_%H%M%S")
docker exec co-found-db pg_dump -U postgres cofound > "/backups/db_backup_$DATE.sql"

# Keep only last 7 days
find /backups -name "db_backup_*.sql" -mtime +7 -delete
```

### Performance Monitoring
- **Application**: PM2 monitoring, New Relic, DataDog
- **Database**: PostgreSQL stats, pgAnalyze
- **Infrastructure**: CloudWatch, Grafana + Prometheus
- **Errors**: Sentry, LogRocket
- **Uptime**: Pingdom, UptimeRobot

## 🔒 Security Considerations

### SSL/TLS
```bash
# Let's Encrypt (free)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d co-found.uz -d www.co-found.uz
```

### Firewall
```bash
# UFW configuration
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Database Security
- Use managed database service (AWS RDS, DigitalOcean Managed Database)
- Enable encryption at rest
- Regular security updates
- Connection pooling
- Read replicas for scaling

### Environment Security
- Store secrets in environment variables
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Regular dependency updates
- Security scanning in CI/CD

## 🚨 Troubleshooting

### Common Issues
```bash
# Container won't start
docker-compose logs web

# Database connection failed
docker exec -it co-found-db psql -U postgres -d cofound

# Permission denied
sudo chown -R $USER:$USER /var/www/co-found

# Out of disk space
docker system prune -af
```

### Performance Issues
```bash
# Check system resources
htop
df -h
free -h

# Database performance
docker exec co-found-db psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# Application metrics
curl https://co-found.uz/api/health
```

For additional support, check the [troubleshooting section](./DEVELOPER_GUIDE.md#troubleshooting) in the developer guide.
