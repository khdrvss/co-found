# Cloudflare Tunnel Setup for co-found.uz

## Step 1: Authenticate with Cloudflare

Run this command and follow the browser login:
```bash
cloudflared tunnel login
```

This will open a browser window. Select the **co-found.uz** domain.

---

## Step 2: Create a Tunnel

```bash
cd /home/ubuntu/projects/cofound/co-found
cloudflared tunnel create co-found
```

This creates a tunnel and saves credentials to `~/.cloudflared/`

Note the **Tunnel ID** from the output!

---

## Step 3: Create Tunnel Configuration

Create the config file:
```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Paste this configuration (replace TUNNEL_ID with your actual ID):
```yaml
tunnel: TUNNEL_ID
credentials-file: /home/ubuntu/.cloudflared/TUNNEL_ID.json

ingress:
  # Frontend - co-found.uz and www.co-found.uz
  - hostname: co-found.uz
    service: http://localhost:3000
  - hostname: www.co-found.uz
    service: http://localhost:3000
  
  # Backend API - api.co-found.uz
  - hostname: api.co-found.uz
    service: http://localhost:4000
  
  # WebSocket support for Socket.IO
  - hostname: api.co-found.uz
    path: /socket.io/*
    service: http://localhost:4000
  
  # Catch-all rule (required)
  - service: http_status:404
```

Save and exit (Ctrl+X, Y, Enter)

---

## Step 4: Route DNS to Tunnel

```bash
# For main domain
cloudflared tunnel route dns co-found co-found.uz

# For www subdomain
cloudflared tunnel route dns co-found www.co-found.uz

# For api subdomain
cloudflared tunnel route dns co-found api.co-found.uz
```

---

## Step 5: Start Your Application

```bash
cd /home/ubuntu/projects/cofound/co-found

# Start backend with PM2
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

pm2 start ecosystem.config.js
pm2 save

# Start frontend dev server (or build for production)
# Option A: Development
npm run dev

# Option B: Production build
npm run build
npx serve dist -l 3000
```

---

## Step 6: Start Cloudflare Tunnel

### Option A: Run in terminal (for testing)
```bash
cloudflared tunnel run co-found
```

Keep this terminal open. Visit https://co-found.uz in browser.

### Option B: Run as a service (for production)
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

Check status:
```bash
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -f
```

---

## Verify It's Working

1. Visit **https://co-found.uz** - Should load frontend
2. Visit **https://api.co-found.uz/api/health** - Should return backend health
3. Check tunnel status in Cloudflare dashboard: https://one.dash.cloudflare.com/

---

## Useful Commands

```bash
# Check tunnel status
cloudflared tunnel list

# View tunnel info
cloudflared tunnel info co-found

# Stop tunnel service
sudo systemctl stop cloudflared

# Restart tunnel service
sudo systemctl restart cloudflared

# View tunnel logs
sudo journalctl -u cloudflared -f

# Delete tunnel (if needed)
cloudflared tunnel delete co-found
```

---

## Troubleshooting

### Issue: "tunnel credentials file doesn't exist"
Make sure you created the tunnel with `cloudflared tunnel create co-found`

### Issue: 502 Bad Gateway
- Check backend is running: `pm2 status`
- Check frontend is running on port 3000
- Verify ports in config.yml match your running services

### Issue: WebSocket not working
- Make sure the Socket.IO path is configured in ingress
- Backend must be running on port 4000

---

## Benefits of Cloudflare Tunnel

✅ **No SSL setup needed** - Cloudflare handles it automatically
✅ **No port forwarding** - Works through firewall
✅ **DDoS protection** - Free Cloudflare protection
✅ **No public IP needed** - Can run from anywhere
✅ **Easy management** - All in Cloudflare dashboard
