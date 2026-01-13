#!/bin/bash

echo "🔍 Testing Co-found.uz Network Access..."

IP="192.168.3.107"

echo ""
echo "📍 Testing Backend API endpoints:"
echo "Health: http://$IP:4000/api/health"
curl -s "http://$IP:4000/api/health" && echo " ✅ Backend Health OK"

echo "Projects: http://$IP:4000/api/projects"  
curl -s "http://$IP:4000/api/projects" > /dev/null && echo " ✅ Projects API OK"

echo "People: http://$IP:4000/api/people"
curl -s "http://$IP:4000/api/people" > /dev/null && echo " ✅ People API OK"

echo ""
echo "📍 Testing Frontend:"
echo "Frontend: http://$IP:3000"
curl -s "http://$IP:3000" > /dev/null && echo " ✅ Frontend OK"

echo ""
echo "🌍 Access URLs:"
echo "   Frontend: http://$IP:3000"
echo "   Backend:  http://$IP:4000"
echo ""
echo "🎉 Network access should now work! Test from another device."
