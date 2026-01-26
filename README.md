# Co-found.uz

A platform connecting co-founders and projects in Uzbekistan.

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Socket.io
- **Database**: PostgreSQL 15 + Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT + Google OAuth
- **Deployment**: Cloudflare Tunnel / Docker + PM2

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

## 🛠️ Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd co-found
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cofound_local

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_ID=your-google-client-id

# Redis
REDIS_URL=redis://localhost:6380

# URLs
VITE_API_URL=http://localhost:4000/api
VITE_FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup

Start PostgreSQL (Docker):

```bash
docker run -d \
  --name cofound-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cofound_local \
  -p 5433:5432 \
  postgres:15-alpine
```

Run Prisma migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start Redis

```bash
docker run -d \
  --name cofound-redis \
  -p 6380:6379 \
  redis:7-alpine
```

### 6. Run Development Server

Start both frontend and backend:

```bash
npm run dev
```

Or separately:

```bash
# Backend only
npm run server

# Frontend only (in another terminal)
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Health Check: http://localhost:4000/api/health

## 🏗️ Build for Production

### Build Frontend

```bash
npm run build
```

### Build Server

```bash
npm run build:server
```

### Build All

```bash
npm run build:prod
```

## 🚀 Production Deployment

### Option 1: Cloudflare Tunnel (Recommended)

See [QUICK_FIX_DNS.md](QUICK_FIX_DNS.md) and [CLOUDFLARE_TUNNEL_SETUP.md](CLOUDFLARE_TUNNEL_SETUP.md) for detailed setup.

#### Quick Start:

1. Install Cloudflare Tunnel:
```bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

2. Login and create tunnel:
```bash
cloudflared tunnel login
cloudflared tunnel create co-found
```

3. Configure tunnel (create `~/.cloudflared/config.yml`)

4. Start services with PM2:
```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
```

5. Update DNS in Cloudflare Dashboard (see QUICK_FIX_DNS.md)

### Option 2: Docker Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed Docker setup.

#### Quick Start:

```bash
# Build image
docker build -t co-found-app:latest .

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Option 3: Traditional VPS with Nginx

See [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for Nginx setup.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📊 Monitoring

### PM2 Dashboard

```bash
pm2 status
pm2 logs
pm2 monit
```

### Health Check Endpoint

```bash
curl http://localhost:4000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-26T12:00:00.000Z",
  "uptime": 12345,
  "checks": {
    "database": {"ok": true},
    "redis": {"ok": true}
  }
}
```

### Metrics Endpoint

```bash
curl http://localhost:4000/metrics
```

Returns Prometheus-compatible metrics.

## 🔒 Security

- All passwords are hashed with bcrypt
- JWT tokens for authentication
- Rate limiting on API endpoints
- Socket.io rate limiting for messages
- Helmet.js for security headers
- CORS protection
- Input sanitization
- SQL injection protection via Prisma

## 📝 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Messages

- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send message
- WebSocket events: `send_message`, `message_received`, `message_read`

### Join Requests

- `GET /api/join-requests` - Get join requests
- `POST /api/join-requests` - Create join request
- `PUT /api/join-requests/:id` - Update request status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Team

Built with ❤️ in Uzbekistan

## 🆘 Support

For issues and questions:
- Create an issue in GitHub
- Email: support@co-found.uz

## 🔗 Links

- Production: https://co-found.uz
- API: https://api.co-found.uz
- Documentation: https://docs.co-found.uz (coming soon)

---

**Note**: Make sure to change all default passwords and secrets in production!
