# 🎯 Docker Quick Reference Card

## The One Command 🔥
```bash
docker-compose up -d
```
**Everything runs. Database + Backend + Frontend.**

---

## Essential Commands

| Command | What It Does |
|---------|--------------|
| `docker-compose up -d` | ⭐ Start everything |
| `docker-compose logs -f` | View real-time logs |
| `docker-compose ps` | List running services |
| `docker-compose down` | Stop everything |
| `docker-compose restart` | Restart all services |
| `docker-compose build` | Rebuild images |

---

## Access Points
```
Frontend (Vite):    http://localhost:5173
Backend API:        http://localhost:5000
Database:           localhost:5432
```

---

## Useful Scripts

### Database Optimization
```bash
docker exec cofound_app npm run migrate:optimize
```

### Database Access
```bash
docker exec -it cofound_db psql -U postgres -d cofound_prod
```

### Shell Access
```bash
docker exec -it cofound_app sh
```

### View Specific Logs
```bash
docker-compose logs -f app    # Backend
docker-compose logs -f db     # Database
```

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Port in use | `taskkill /PID <PID> /F` |
| Won't start | `docker-compose down -v && docker-compose up -d --build` |
| DB not ready | `docker-compose logs db` |
| Need to reset | `docker-compose down -v` |

---

## Start, Stop, Status

```bash
# Start
docker-compose up -d

# Check status
docker-compose ps

# Stop
docker-compose down

# Reset everything
docker-compose down -v
docker-compose up -d --build
```

---

## Development

```bash
# View logs while developing
docker-compose logs -f app

# Code changes auto-reload

# Database updates
docker exec cofound_app npm run migrate:optimize

# Rebuild after changes
docker-compose up -d --build
```

---

## For Production

```bash
# Start with Nginx + SSL
docker-compose --profile prod up -d

# Still accessible via
# http://localhost (port 80)
# https://localhost (port 443)
```

---

## Troubleshooting Flow

```
Problem?
   ↓
Run: docker-compose logs -f
   ↓
See the error? Google it
   ↓
Still stuck? Try:
docker-compose down -v
docker-compose up -d --build
   ↓
If all else fails:
docker system prune -a
docker-compose up -d --build
```

---

## File Locations

| What | Where |
|------|-------|
| Config | `.env` |
| Services | `docker-compose.yml` |
| Image | `Dockerfile` |
| Database | `schema.sql` |
| Migrations | `migrations/` |
| Source Code | `src/` |
| API Routes | `src/server/routes.ts` |
| Rate Limits | `src/server/rate-limit.ts` |
| Sanitization | `src/server/sanitize.ts` |

---

## Environment Variables

Edit `.env` to change:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=cofound_prod
JWT_SECRET=your-secret-key
NODE_ENV=production
```

Then restart:
```bash
docker-compose restart app
```

---

## Status Check

```bash
# All good? Should see:
$ docker-compose ps

NAME         STATUS           PORTS
cofound_db   Up (healthy)     5432/tcp
cofound_app  Up               0.0.0.0:5000->5000/tcp
                              0.0.0.0:5173->5173/tcp
```

---

## 📱 URL Shortcuts

```
http://localhost:5173   Frontend (dev)
http://localhost:5000   Backend API
http://localhost:5432   Database
```

---

## 🎯 Remember

- **One command**: `docker-compose up -d`
- **Check logs**: `docker-compose logs -f`
- **Stop all**: `docker-compose down`
- **Reset**: `docker-compose down -v && docker-compose up -d`

---

**Print this out. Keep it handy. That's all you need.** 📋
