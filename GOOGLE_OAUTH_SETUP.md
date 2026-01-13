# Google OAuth Configuration Guide

## ⚠️ IMPORTANT: Configure Google Cloud Console

Your Google OAuth integration is almost complete! You just need to add the authorized origins in Google Cloud Console.

### Steps to Fix "Error 400: origin_mismatch"

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Sign in with your Google account (oltindevoruz@gmail.com)

2. **Select Your Project**
   - Click on the project selector at the top
   - Select "cofound" project (or create one if it doesn't exist)

3. **Click on Your OAuth 2.0 Client ID**
   - Find: `929343442842-4lpo74evt4dlskfln5bv86j26cl9sfne.apps.googleusercontent.com`
   - Click on it to edit

4. **Add Authorized JavaScript Origins**
   Click "+ ADD URI" under "Authorized JavaScript origins" and add BOTH:
   ```
   http://localhost:3000
   http://localhost:4000
   ```

5. **Add Authorized Redirect URIs** (Optional, for production)
   If you want to add redirect URIs for callback handling:
   ```
   http://localhost:3000/auth/google/callback
   ```

6. **Save Changes**
   - Click "SAVE" at the bottom
   - Wait 2-3 minutes for changes to propagate

7. **Test**
   - Refresh your browser at http://localhost:3000/auth
   - Click "Sign in with Google"
   - It should work now!

---

## For Production Deployment

When you deploy to https://co-found.uz, you'll need to add:

**Authorized JavaScript origins:**
```
https://co-found.uz
```

**Authorized redirect URIs:**
```
https://co-found.uz/auth/google/callback
```

---

## Current Configuration

✅ Frontend: http://localhost:3000
✅ Backend: http://localhost:4000/api
✅ Google Client ID: 929343442842-4lpo74evt4dlskfln5bv86j26cl9sfne.apps.googleusercontent.com
✅ Code: Fixed and ready to use
❌ **Google Cloud Console: NEEDS CONFIGURATION**

---

## Files Modified

- ✅ `/src/contexts/AuthContext.tsx` - Added `signInWithGoogle` function
- ✅ `/src/components/dialogs/AuthDialog.tsx` - Added GoogleLogin component
- ✅ `/src/pages/Auth.tsx` - Fixed Google authentication handlers
- ✅ `/src/main.tsx` - Wrapped with GoogleOAuthProvider
- ✅ `/src/server/routes.ts` - Added `/api/auth/google` endpoint
- ✅ `/.env.local` - Added VITE_GOOGLE_CLIENT_ID
- ✅ Database migration - Added `google_id` column to users table

---

## Testing Checklist

After configuring Google Cloud Console:

- [ ] Visit http://localhost:3000
- [ ] Click "Kirish" button
- [ ] Click "Sign in with Google"
- [ ] Google popup should open (no error)
- [ ] Select your Google account
- [ ] You should be logged in and redirected to home page
- [ ] Your profile should show Google avatar and name

---

## Troubleshooting

If you still see errors:

1. **Clear browser cache** and cookies for localhost
2. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
3. **Wait 2-3 minutes** after saving Google Cloud Console changes
4. **Check browser console** for detailed error messages
5. **Verify Client ID** matches in both .env.local and Google Cloud Console

