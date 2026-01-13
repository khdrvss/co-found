#!/bin/bash

echo "🔍 Debug Co-found.uz Black Screen Issue"

IP="192.168.3.107"

echo ""
echo "1. ✅ Testing backend API endpoints:"
echo "   Health: http://$IP:4000/api/health"
HEALTH=$(curl -s "http://$IP:4000/api/health" | grep "ok" || echo "FAIL")
echo "   Result: $HEALTH"

echo "   Projects: http://$IP:4000/api/projects"  
PROJECTS=$(curl -s "http://$IP:4000/api/projects" -o /dev/null -w "%{http_code}")
echo "   Result: HTTP $PROJECTS"

echo "   People: http://$IP:4000/api/people"
PEOPLE=$(curl -s "http://$IP:4000/api/people" -o /dev/null -w "%{http_code}")
echo "   Result: HTTP $PEOPLE"

echo ""
echo "2. ✅ Testing frontend HTML:"
echo "   Frontend: http://$IP:3000"
HTML=$(curl -s "http://$IP:3000" | grep "root" || echo "FAIL")
echo "   HTML contains root div: $(echo $HTML | head -c 50)..."

echo ""
echo "3. 🌍 URLs to test:"
echo "   Local:   http://localhost:3000"
echo "   Network: http://$IP:3000"
echo ""
echo "💡 If backend works but frontend is black:"
echo "   - Check browser console for JavaScript errors"
echo "   - Try localhost:3000 first to verify React app works"
echo "   - Clear browser cache and hard refresh (Ctrl+Shift+R)"
