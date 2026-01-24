#!/bin/bash
# Deployment script for co-found.uz

set -e

echo "🚀 Starting deployment for co-found.uz..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/ubuntu/projects/cofound/co-found"
BUILD_DIR="$PROJECT_DIR/dist"
NGINX_DIR="/var/www/co-found"

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
cd "$PROJECT_DIR"
npm install

echo -e "${YELLOW}🏗️  Building frontend for production...${NC}"
npm run build

echo -e "${YELLOW}📂 Creating deployment directory...${NC}"
sudo mkdir -p "$NGINX_DIR"

echo -e "${YELLOW}📋 Copying build files...${NC}"
sudo cp -r "$BUILD_DIR"/* "$NGINX_DIR/"

echo -e "${YELLOW}🔐 Setting proper permissions...${NC}"
sudo chown -R www-data:www-data "$NGINX_DIR"
sudo chmod -R 755 "$NGINX_DIR"

echo -e "${YELLOW}🔧 Copying Nginx configuration...${NC}"
sudo cp "$PROJECT_DIR/nginx-co-found.conf" /etc/nginx/sites-available/co-found.uz

echo -e "${YELLOW}🔗 Creating symbolic link...${NC}"
sudo ln -sf /etc/nginx/sites-available/co-found.uz /etc/nginx/sites-enabled/

echo -e "${YELLOW}✅ Testing Nginx configuration...${NC}"
sudo nginx -t

echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
sudo systemctl reload nginx

echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
cd "$PROJECT_DIR"
npx prisma migrate deploy

echo -e "${YELLOW}🔄 Restarting backend service...${NC}"
# If using PM2
if command -v pm2 &> /dev/null; then
    pm2 restart cofound-api || pm2 start npm --name cofound-api -- run server
elif command -v systemctl &> /dev/null && sudo systemctl list-units --type=service | grep -q cofound; then
    sudo systemctl restart cofound
else
    echo -e "${YELLOW}⚠️  No PM2 or systemd service found. Please restart backend manually.${NC}"
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Your app should now be live at https://co-found.uz${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Make sure SSL certificates are set up (use certbot)"
echo "2. Update .env.production with production credentials"
echo "3. Configure your backend service to start on boot"
echo "4. Set up monitoring and logging"
