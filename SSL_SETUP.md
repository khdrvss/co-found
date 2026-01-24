# SSL Setup Guide for co-found.uz

## Prerequisites
- Domain co-found.uz pointing to your server IP
- Nginx installed
- Port 80 and 443 open in firewall

## Install Certbot

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Verify installation
certbot --version
```

## Obtain SSL Certificate

```bash
# For co-found.uz and www.co-found.uz
sudo certbot --nginx -d co-found.uz -d www.co-found.uz -d api.co-found.uz

# Or manually with webroot
sudo certbot certonly --webroot -w /var/www/certbot \
  -d co-found.uz \
  -d www.co-found.uz \
  -d api.co-found.uz \
  --email your-email@example.com \
  --agree-tos
```

## Auto-renewal

Certbot automatically sets up renewal. Test it with:

```bash
sudo certbot renew --dry-run
```

## Update Nginx Config

After obtaining certificates, the nginx-co-found.conf is already configured with:
- SSL certificate paths
- HTTPS redirects
- Security headers

## Verify SSL

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check SSL grade at:
# https://www.ssllabs.com/ssltest/analyze.html?d=co-found.uz
```

## Troubleshooting

### Certificate Not Found
Make sure DNS is properly configured:
```bash
dig co-found.uz +short
```

### Permission Denied
```bash
sudo chown -R www-data:www-data /etc/letsencrypt
```

### Renewal Failed
Check logs:
```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

## Manual Renewal

```bash
sudo certbot renew
sudo systemctl reload nginx
```
