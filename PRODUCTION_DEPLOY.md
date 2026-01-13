# Co-found.uz - Production Deployment Guide

## 🚀 Quick Deploy to Any Server

### Option 1: Direct Server Deployment

1. **Build for production:**
   ```bash
   npm run build:prod
   ```

2. **Upload to your server:**
   ```bash
   # Copy dist/ folder to your server
   scp -r dist/ user@your-server:/path/to/cofound/
   ```

3. **On your server:**
   ```bash
   cd /path/to/cofound/dist
   npm start
   ```

### Option 2: Docker Deployment (Recommended)

1. **Build and deploy with Docker:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Option 3: Popular Hosting Services

#### Vercel (Frontend + Serverless API)
```bash
npm install -g vercel
vercel --prod
```

#### Railway
```bash
railway login
railway deploy
```

#### DigitalOcean App Platform
- Connect your GitHub repo
- Set environment variables
- Deploy automatically

#### AWS EC2 / Google Cloud / Azure VM
- Use the Direct Server Deployment method above

## 🌍 Network Configuration

### For Development (Network Access)
The app is already configured to accept network connections.

**Frontend:** http://your-ip:3000  
**Backend API:** http://your-ip:4000

### For Production (Internet Access)
1. Get a domain name
2. Set up SSL certificate (Let's Encrypt recommended)
3. Use a reverse proxy (nginx/apache)
4. Update `.env.production` with your domain

## 🔧 Environment Variables

Copy `.env.production` to `.env` and update:
- `DATABASE_URL` - Your production database
- `JWT_SECRET` - Strong secret key
- `VITE_API_URL` - Your API domain
- `ALLOWED_ORIGINS` - Your frontend domain

## 🗄️ Database Setup

### PostgreSQL (Recommended)
```bash
# Create database
createdb cofound_prod

# Run migrations
npm run migrate:prod
```

## 🔒 Security Checklist

- ✅ JWT secret is strong and unique
- ✅ Database credentials are secure
- ✅ CORS is properly configured
- ✅ Rate limiting is enabled
- ✅ Input sanitization is active
- ✅ HTTPS is configured (production)

## 🎯 Ready for Online!

Your app is now configured and ready to be deployed to any hosting service. Choose the deployment option that works best for you!
