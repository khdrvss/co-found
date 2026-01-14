# Co-found.uz - Co-Founder & Project Platform

[![Tests](https://github.com/khdrvss/co-found/actions/workflows/test.yml/badge.svg)](https://github.com/khdrvss/co-found/actions/workflows/test.yml)
[![Security](https://github.com/khdrvss/co-found/actions/workflows/security.yml/badge.svg)](https://github.com/khdrvss/co-found/actions/workflows/security.yml)

A modern platform for connecting co-founders and discovering projects in Uzbekistan. Built with React, TypeScript, Node.js, PostgreSQL, and Docker.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/khdrvss/co-found.git
cd co-found

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start with Docker (recommended)
docker-compose up -d

# Or start manually
npm run dev
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** + **shadcn/ui** components
- **React Query** for server state
- **React Router** for navigation
- **PWA** support

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** with **Prisma** ORM
- **JWT** authentication
- **Rate limiting** & **input sanitization**
- **Comprehensive error handling**

### Security Features
- ✅ Rate limiting (auth: 5/15min, mutations: 30/min)
- ✅ Input sanitization (XSS prevention)
- ✅ JWT token authentication
- ✅ Password hashing (bcryptjs)
- ✅ Environment-based secrets
- ✅ CORS protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test
npm test -- AuthDialog.test.tsx
```

## 📊 Database Schema

Key entities:
- **Users** - Authentication and basic info
- **Profiles** - Extended user information
- **Projects** - Project listings and details
- **Messages** - Private messaging system
- **Notifications** - Real-time notifications

## 🔧 Development

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Docker (optional but recommended)

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/cofound
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cofound_local
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_ID=your-google-client-id

# Server
PORT=5000
NODE_ENV=development
```

### API Endpoints
```bash
# Authentication
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me

# Users & Profiles
GET  /api/users
GET  /api/users/:id
PUT  /api/users/profile

# Projects
GET  /api/projects
POST /api/projects
PUT  /api/projects/:id
DELETE /api/projects/:id

# Health Check
GET  /api/health
```

## 🐳 Docker Deployment

See [DEPLOY_NEW.md](./DEPLOY_NEW.md) for detailed deployment instructions.

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Development
docker-compose up -d
```

## 🔁 Local Redis scaling smoke test

To validate the Socket.IO Redis adapter locally (checks cross-instance pub/sub):

1. Start services including Redis and a secondary app instance (dev profile)

```bash
# Start DB + Redis + primary app
docker compose up -d db redis app

# Start a second app instance on port 5001 (profile 'local')
docker compose --profile local up -d app2
```

2. Run the smoke test (this script will create two users, connect a socket to each app instance, send a message from app:5000 and verify `message.created` arrives at app2:5001):

```bash
npm run smoke:redis
```

Expected outcome: the test prints that both sockets connected and you see `sockB got message` even though the message was sent through the other app instance — this confirms Redis adapter pub/sub is functioning.

Notes:
- In production set `REDIS_URL` to your managed Redis instance and ensure `REDIS_URL` is present in the env for all API instances.
- This test is intentionally simple; for full load testing consider using `k6` or `ghz` to simulate thousands of concurrent sockets.

## 🛠️ VPS Deployment (Docker)

These are the minimal steps to deploy on a VPS using Docker Compose (recommended for small clusters):

1. Prepare the server and clone the repo

```bash
ssh your-vps
sudo apt update && sudo apt install -y docker docker-compose
git clone https://github.com/khdrvss/co-found.git
cd co-found
```

2. Configure environment

- Copy `.env.example` to `.env` and set production values (DATABASE_URL, JWT_SECRET, REDIS_URL, VITE_API_URL, etc.)

3. Build & migrate

```bash
# Build and start DB and Redis and app
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations once (idempotent)
docker compose -f docker-compose.prod.yml run --rm app npm run migrate
```

4. Start services

```bash
docker compose -f docker-compose.prod.yml up -d
```

5. Verify health

```bash
curl -fS http://localhost:5000/api/health | jq
```

Notes:
- For zero-downtime and scaling, use a load balancer and run multiple `app` instances (e.g. `docker compose up --scale app=3 -d`).
- Always run the migrations from a single control node prior to scaling new app instances.
- Add monitoring (Prometheus, Sentry) and backups for DB before going to production.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Run tests (`npm test`)
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Deployment Guide](./DEPLOY_NEW.md)
- [Developer Guide](./DEVELOPER_GUIDE_NEW.md)
- [API Documentation](./API_DOCS.md)

## 📞 Support

For support, email support@co-found.uz or join our Telegram channel.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
