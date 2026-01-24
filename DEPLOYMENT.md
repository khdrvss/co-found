# Deployment README for co-found.uz

## 🚀 Quick Deployment Guide

### 1. Prerequisites

```bash
# Install Node.js 20+
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install PM2 for process management
npm install -g pm2

# Install Nginx
sudo apt update
sudo apt install nginx -y
```

### 2. Database Setup

```bash
# Ensure PostgreSQL is running
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create production database
sudo -u postgres psql -c "CREATE DATABASE cofound_prod;"
sudo -u postgres psql -c "CREATE USER cofound_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cofound_prod TO cofound_user;"
```

### 3. Configure Environment

```bash
cd /home/ubuntu/projects/cofound/co-found

# Copy production environment file
cp .env.production .env

# Edit with your actual values
nano .env

# Important: Update these values:
# - JWT_SECRET (use a strong random string)
# - Database credentials
# - ALLOWED_ORIGINS
```

### 4. Install Dependencies & Build

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Run database migrations
npx prisma migrate deploy
```

### 5. Deploy Frontend

```bash
# Run the deployment script
./deploy.sh

# Or manually:
sudo mkdir -p /var/www/co-found
sudo cp -r dist/* /var/www/co-found/
sudo chown -R www-data:www-data /var/www/co-found
sudo chmod -R 755 /var/www/co-found
```

### 6. Setup Nginx

```bash
# Copy Nginx configuration
sudo cp nginx-co-found.conf /etc/nginx/sites-available/co-found.uz
sudo ln -s /etc/nginx/sites-available/co-found.uz /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 7. Setup SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d co-found.uz -d www.co-found.uz -d api.co-found.uz

# Test auto-renewal
sudo certbot renew --dry-run
```

### 8. Start Backend Service

```bash
# Using PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Or create systemd service (alternative)
sudo nano /etc/systemd/system/cofound.service
# Add service configuration (see systemd section below)
sudo systemctl enable cofound
sudo systemctl start cofound
```

### 9. Verify Deployment

```bash
# Check backend is running
curl http://localhost:4000/api/health

# Check PM2 status
pm2 status

# Check Nginx
sudo systemctl status nginx

# View logs
pm2 logs cofound-api
```

## 🔧 Systemd Service (Alternative to PM2)

Create `/etc/systemd/system/cofound.service`:

```ini
[Unit]
Description=Co-found API Server
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/projects/cofound/co-found
Environment=NODE_ENV=production
ExecStart=/home/ubuntu/.nvm/versions/node/v20.20.0/bin/node /home/ubuntu/.nvm/versions/node/v20.20.0/bin/tsx src/server/index.ts
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=cofound-api

[Install]
WantedBy=multi-user.target
```

## 📊 Monitoring

```bash
# PM2 Monitoring
pm2 monit

# View logs
pm2 logs cofound-api

# Check server resources
htop

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Update/Redeploy

```bash
cd /home/ubuntu/projects/cofound/co-found

# Pull latest changes
git pull

# Install any new dependencies
npm install

# Build frontend
npm run build

# Run migrations
npx prisma migrate deploy

# Deploy
./deploy.sh

# Restart backend
pm2 restart cofound-api
```

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs cofound-api

# Check port is not in use
sudo lsof -i :4000

# Check database connection
psql -U cofound_user -d cofound_prod -h localhost -c "SELECT 1;"
```

### Frontend shows blank page
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify build files exist
ls -la /var/www/co-found/

# Check Nginx is running
sudo systemctl status nginx
```

### SSL certificate issues
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check SSL configuration
sudo nginx -t
```

## 🔐 Security Checklist

- [ ] Strong JWT_SECRET set
- [ ] Database password changed from default
- [ ] Firewall configured (ufw or iptables)
- [ ] SSL/HTTPS enabled
- [ ] ALLOWED_ORIGINS properly configured
- [ ] Rate limiting enabled
- [ ] Regular backups configured
- [ ] PM2 or systemd service enabled
- [ ] Log rotation configured

## 🌐 DNS Configuration

Point your domain to your server:

```
A Record: co-found.uz → YOUR_SERVER_IP
A Record: www.co-found.uz → YOUR_SERVER_IP
A Record: api.co-found.uz → YOUR_SERVER_IP
```

## 📞 Support

For issues, check logs in:
- Backend: `pm2 logs cofound-api` or `/var/log/syslog`
- Nginx: `/var/log/nginx/error.log`
- Database: `/var/log/postgresql/`
