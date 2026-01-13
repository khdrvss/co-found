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

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Development
docker-compose up -d
```

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

- [Deployment Guide](./DEPLOY.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Docker Guide](./DOCKER_GUIDE.md)
- [API Documentation](./API_DOCS.md)

## 📞 Support

For support, email support@co-found.uz or join our Telegram channel.
