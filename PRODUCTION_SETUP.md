# Complete Production Deployment Guide for co-found.uz

## 📋 Overview
This guide will walk you through deploying co-found to production on your domain co-found.uz.

---

## STEP 1: DNS Configuration (Do this first!)

### Your Server IP
First, find your server's public IP address:
```bash
curl -s ifconfig.me
```

### Configure DNS Records

Go to your domain registrar's DNS management panel (where you bought co-found.uz) and add these A records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 3600 |
| A | www | YOUR_SERVER_IP | 3600 |
| A | api | YOUR_SERVER_IP | 3600 |

**Example (if your server IP is 123.45.67.89):**
- `co-found.uz` → `123.45.67.89`
- `www.co-found.uz` → `123.45.67.89`
- `api.co-found.uz` → `123.45.67.89`

**Wait 5-30 minutes** for DNS propagation. You can check with:
```bash
dig co-found.uz +short
dig www.co-found.uz +short
dig api.co-found.uz +short
```
All should return your server IP.

---

## STEP 2: Install Prerequisites

### 2.1 Install Nginx (if not already installed)
```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.2 Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### 2.3 Install Certbot (for SSL)
```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

## STEP 3: Prepare Production Environment

### 3.1 Update Environment Variables
```bash
cd /home/ubuntu/projects/cofound/co-found
nano .env
```

**Update these critical values:**
```bash
# Generate a strong secret
JWT_SECRET=$(openssl rand -base64 32)

# Update database for production (optional - can keep localhost)
DB_NAME=cofound_prod
DB_PASSWORD=your_secure_password_here

# Already configured:
VITE_API_URL=https://api.co-found.uz/api
VITE_FRONTEND_URL=https://co-found.uz
ALLOWED_ORIGINS=https://co-found.uz,https://www.co-found.uz,https://api.co-found.uz
```

Save and exit (Ctrl+X, Y, Enter)

---

## STEP 4: Build and Deploy

### 4.1 Make deploy script executable
```bash
chmod +x deploy.sh
```

### 4.2 Run deployment
```bash
./deploy.sh
```

This will:
- ✅ Install dependencies
- ✅ Build frontend for production
- ✅ Copy files to `/var/www/co-found`
- ✅ Configure Nginx
- ✅ Run database migrations

---

## STEP 5: Start Backend with PM2

```bash
# Start backend server
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to auto-start on server reboot
pm2 startup
# Copy and run the command it outputs
```

**Check backend is running:**
```bash
pm2 status
pm2 logs cofound-api
```

---

## STEP 6: Setup SSL Certificates

**IMPORTANT:** DNS must be propagated first (wait at least 5-10 minutes after DNS setup)

### 6.1 Verify domains resolve to your server
```bash
ping co-found.uz
ping www.co-found.uz
ping api.co-found.uz
```
All should show your server's IP.

### 6.2 Obtain SSL certificates
```bash
sudo certbot --nginx -d co-found.uz -d www.co-found.uz -d api.co-found.uz
```

**Follow the prompts:**
1. Enter your email address
2. Agree to Terms of Service (Y)
3. Share email with EFF? (optional - Y or N)
4. Choose option 2: "Redirect - Make all requests redirect to secure HTTPS"

### 6.3 Test SSL renewal
```bash
sudo certbot renew --dry-run
```

SSL certificates will auto-renew before expiration.

---

## STEP 7: Verify Deployment

### Check all services are running:
```bash
# Check Nginx
sudo systemctl status nginx

# Check PM2
pm2 status

# Check backend logs
pm2 logs cofound-api

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Test your website:
1. Open browser and visit: **https://co-found.uz**
2. Check API health: **https://api.co-found.uz/api/health**
3. Check redirects:
   - http://co-found.uz → https://co-found.uz ✅
   - http://www.co-found.uz → https://co-found.uz ✅

---

## 🔧 Useful Commands

### PM2 Management
```bash
pm2 status                    # Check all processes
pm2 logs cofound-api         # View logs
pm2 restart cofound-api      # Restart backend
pm2 stop cofound-api         # Stop backend
pm2 delete cofound-api       # Remove process
```

### Nginx Management
```bash
sudo nginx -t                # Test configuration
sudo systemctl reload nginx  # Reload config
sudo systemctl restart nginx # Restart Nginx
sudo systemctl status nginx  # Check status
```

### SSL Management
```bash
sudo certbot certificates    # List certificates
sudo certbot renew          # Renew certificates
sudo certbot delete         # Remove certificate
```

### Deployment Updates
```bash
cd /home/ubuntu/projects/cofound/co-found
git pull                    # Pull latest code (if using git)
./deploy.sh                 # Rebuild and deploy frontend
pm2 restart cofound-api     # Restart backend
```

---

## 🛠️ Troubleshooting

### Issue: "Connection refused" or 502 Bad Gateway
**Solution:**
```bash
# Check if backend is running
pm2 status
pm2 logs cofound-api

# Restart backend
pm2 restart cofound-api
```

### Issue: DNS not resolving
**Solution:**
- Wait longer (DNS can take up to 48 hours but usually 5-30 minutes)
- Verify DNS records at your registrar
- Clear browser cache or try incognito mode

### Issue: Certbot fails with "connection refused"
**Solution:**
- Ensure DNS is fully propagated
- Check Nginx is running: `sudo systemctl status nginx`
- Temporarily disable firewall: `sudo ufw allow 80,443/tcp`

### Issue: 404 Not Found
**Solution:**
```bash
# Check Nginx is serving files
ls -la /var/www/co-found/

# Rerun deployment
./deploy.sh
```

### Issue: WebSocket connection failed
**Solution:**
- SSL must be configured (HTTPS required for WSS)
- Check Nginx proxy settings in `/etc/nginx/sites-available/co-found.uz`

---

## 📊 Monitoring

### View real-time logs
```bash
# Backend logs
pm2 logs cofound-api --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Check resource usage
```bash
pm2 monit
htop
```

---

## 🔒 Security Checklist

- [ ] Strong JWT_SECRET set in .env
- [ ] Database password changed from default
- [ ] SSL certificates installed and working
- [ ] Firewall configured (ufw)
- [ ] Only necessary ports open (80, 443, 22, 4000)
- [ ] PM2 startup configured
- [ ] Regular backups of database
- [ ] CORS origins limited to your domains

---

## 🎉 Success Checklist

Once everything is working, you should have:

- [ ] https://co-found.uz loads your application
- [ ] https://www.co-found.uz redirects to https://co-found.uz
- [ ] https://api.co-found.uz/api/health returns 200 OK
- [ ] Green padlock (SSL) in browser
- [ ] WebSocket connections working
- [ ] PM2 shows backend running
- [ ] Auto-restart on server reboot configured

---

## 📞 Need Help?

If you encounter issues:
1. Check the logs (PM2 and Nginx)
2. Verify DNS propagation
3. Ensure all services are running
4. Check firewall settings

Common log locations:
- PM2: `~/.pm2/logs/`
- Nginx: `/var/log/nginx/`
- Certbot: `/var/log/letsencrypt/`
