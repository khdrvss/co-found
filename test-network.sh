#!/bin/bash

echo "🌐 Testing Co-found.uz Network Access..."

# Get current IP
IP=$(hostname -I | awk '{print $1}')
echo "📍 Your IP: $IP"

# Start the servers in the background
echo "🚀 Starting servers..."
npm run dev &
DEV_PID=$!

# Wait for servers to start
sleep 5

echo "🔍 Testing endpoints..."

# Test backend health
echo "Testing backend health: http://$IP:4000/api/health"
if curl -s "http://$IP:4000/api/health" > /dev/null; then
    echo "✅ Backend is accessible from network"
else
    echo "❌ Backend is not accessible from network"
fi

# Test frontend
echo "Testing frontend: http://$IP:3000"
if curl -s "http://$IP:3000" > /dev/null; then
    echo "✅ Frontend is accessible from network"
else
    echo "❌ Frontend is not accessible from network"
fi

echo ""
echo "🌍 Access your app from any device on your network:"
echo "   Frontend: http://$IP:3000"
echo "   Backend:  http://$IP:4000"
echo ""
echo "📱 Test on your phone/other devices using the same WiFi"
echo ""
echo "🛑 Press Ctrl+C to stop the servers"

# Wait for user to stop
wait $DEV_PID
