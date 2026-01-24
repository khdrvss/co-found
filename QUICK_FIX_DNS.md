# ✅ FINAL STEP: Update Cloudflare DNS

Your tunnel is running! Now you just need to update DNS records in Cloudflare.

## Go to Cloudflare Dashboard

1. **Visit:** https://dash.cloudflare.com/
2. **Select:** co-found.uz domain
3. **Click:** DNS on the left sidebar

---

## Update/Create These DNS Records

You need to **DELETE** any existing A records and create **CNAME** records instead:

### Records to Create:

| Type | Name | Target | Proxy Status | TTL |
|------|------|--------|--------------|-----|
| CNAME | @ | `b7d437f8-996a-4069-b3a3-d7b7486740d8.cfargotunnel.com` | Proxied (Orange Cloud) | Auto |
| CNAME | www | `b7d437f8-996a-4069-b3a3-d7b7486740d8.cfargotunnel.com` | Proxied (Orange Cloud) | Auto |
| CNAME | api | `b7d437f8-996a-4069-b3a3-d7b7486740d8.cfargotunnel.com` | Proxied (Orange Cloud) | Auto |

**Important:** Make sure the **Proxy status** is **ON** (orange cloud icon)

---

## Step-by-Step in Cloudflare Dashboard:

### 1. Delete existing A records (if any):
- Find any A records for `co-found.uz`, `www`, or `api`
- Click the record → Delete

### 2. Add CNAME for co-found.uz:
- Click "Add record"
- Type: **CNAME**
- Name: **@** (for root domain)
- Target: **b7d437f8-996a-4069-b3a3-d7b7486740d8.cfargotunnel.com**
- Proxy status: **Proxied** (orange cloud)
- Click **Save**

### 3. Add CNAME for www.co-found.uz:
- Click "Add record"
- Type: **CNAME**
- Name: **www**
- Target: **b7d437f8-996a-4069-b3a3-d7b7486740d8.cfargotunnel.com**
- Proxy status: **Proxied** (orange cloud)
- Click **Save**

### 4. Add CNAME for api.co-found.uz:
- Click "Add record"
- Type: **CNAME**
- Name: **api**
- Target: **b7d437f8-996a-4069-b3a3-d7b7486740d8.cfargotunnel.com**
- Proxy status: **Proxied** (orange cloud)
- Click **Save**

---

## ⏱️ Wait 1-2 Minutes

DNS propagation through Cloudflare is usually instant to 2 minutes.

---

## ✅ Test Your Site

After updating DNS, visit:

1. **https://co-found.uz** → Should load your frontend
2. **https://www.co-found.uz** → Should load your frontend
3. **https://api.co-found.uz/api/health** → Should return backend health

---

## 🎉 All Set!

Your application is now live with:
- ✅ Free SSL (automatic from Cloudflare)
- ✅ DDoS protection
- ✅ CDN caching
- ✅ No port forwarding needed
- ✅ Backend and frontend both running

---

## Keep Services Running

Your services are now managed by PM2 and will auto-restart if they crash.

### To make tunnel run as a service (auto-start on reboot):

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

### To check service status:

```bash
# Check PM2 services
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
pm2 status

# Check tunnel status
sudo systemctl status cloudflared
```

---

## Troubleshooting

### If site doesn't load:
1. Wait 2-5 minutes for DNS
2. Clear browser cache (Ctrl+Shift+Del)
3. Try incognito mode
4. Check tunnel is running: `ps aux | grep cloudflared`

### To restart services:
```bash
# Restart backend
pm2 restart cofound-api

# Restart frontend  
pm2 restart cofound-frontend

# Restart tunnel
sudo systemctl restart cloudflared
```

### To view logs:
```bash
# Backend logs
pm2 logs cofound-api

# Frontend logs
pm2 logs cofound-frontend

# Tunnel logs
sudo journalctl -u cloudflared -f
```
