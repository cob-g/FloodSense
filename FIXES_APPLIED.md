# FloodSense - CORS and Connection Issues Fixed

## 🎯 Issues Identified and Resolved

### 1. ✅ Missing Internationalization Translations (English)
**Problem:** English translations were missing for Learn and About pages, causing translation keys to display instead of proper text
**Solution:**
- Added complete English `learn` section with 48+ translation keys
- Added complete English `about` section with 56+ translation keys
- Professionally translated all Tagalog content to contextually appropriate English
- Maintained consistency with existing translation style and terminology

**Date Fixed:** 2026-03-28

**Files Modified:**
- `client/src/i18n.js` - Lines 165-324 (added learn and about sections to English translations)

**What was fixed:**
- Learn page now displays proper English text instead of keys like `learn.hero.title1`
- About page now displays proper English text instead of keys like `about.hero.title`
- All sections fully translated: hero, educational content, features, FAQ, mission, journey, values, tech stack
- Tagalog translations remain intact and working correctly
- Language switcher now works perfectly for both languages

### 2. ✅ Missing Environment Configuration
**Problem:** No `.env` files existed, causing configuration issues
**Solution:**
- Created `server/.env` from `.env.example`
- Created `client/.env` from `.env.example`
- Added `CLIENT_URL` configuration to server `.env.example`
- Added `SEED_ADMIN` flag to control admin seeding

### 3. ✅ CORS Configuration Issues
**Problem:** Server CORS wasn't properly validating origins
**Solution:**
- Implemented proper CORS origin callback function
- Added logging for blocked CORS requests
- Configured to allow `http://localhost:5173` (Vite default)
- Added credentials support for cookies

**Files Modified:**
- `server/src/index.js` - Lines 29-61 (CORS middleware)

### 4. ✅ Port Configuration Mismatch
**Problem:** Vite configured for port 3000, but Vite defaults to 5173
**Solution:**
- Changed `vite.config.js` to use port 5173
- Removed unnecessary proxy configuration
- Updated server to prioritize port 5173 in allowed origins

**Files Modified:**
- `client/vite.config.js` - Simplified configuration

### 5. ✅ Socket.IO CORS Configuration
**Problem:** Socket.IO CORS didn't match HTTP CORS settings
**Solution:**
- Updated Socket.IO server with matching origin validation
- Added credentials support
- Ensured consistent allowed origins

**Files Modified:**
- `server/src/index.js` - Lines 28-48 (Socket.IO setup)

### 6. ✅ Circular Dependency in SocketContext
**Problem:** `SocketContext` → `useAuth` → `AuthContext` → `socket` → `SocketContext`
**Solution:**
- Changed `SocketContext` to use `AuthContext` directly via `useContext`
- Removed dependency on `useAuth` hook

**Files Modified:**
- `client/src/contexts/SocketContext.jsx` - Lines 1-12

## 📁 Files Created

### 1. `SETUP.md`
Complete setup guide with:
- Prerequisites
- Backend setup steps
- Frontend setup steps
- Verification steps
- Common issues and solutions
- Admin account creation
- Development workflow

### 2. `start-dev.ps1`
PowerShell script to:
- Check for `.env` files (creates if missing)
- Verify MongoDB is running
- Start backend and frontend in separate windows
- Display helpful startup information

### 3. `test-connection.ps1`
PowerShell script to test:
- MongoDB connection
- Backend API availability
- Frontend availability
- CORS configuration
- Environment files existence

### 4. `check-setup.js`
Node.js script for automated setup verification

## 🚀 Quick Start Guide

### Option 1: Using the Start Script (Recommended)
```powershell
# From the FloodSense root directory
.\start-dev.ps1
```

This will:
1. Check/create `.env` files
2. Verify MongoDB is running
3. Start backend on http://localhost:5000
4. Start frontend on http://localhost:5173
5. Open both in separate terminal windows

### Option 2: Manual Start
```powershell
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

### Option 3: Test Connection First
```powershell
# Check if everything is configured correctly
.\test-connection.ps1
```

## 🔍 Verification Steps

### 1. Check Backend Health
Open in browser: http://localhost:5000/api/ping

Expected response:
```json
{
  "message": "FloodSense API is running!",
  "timestamp": "2025-10-04T06:19:16.000Z",
  "status": "healthy",
  "version": "1.0.0"
}
```

### 2. Check Frontend
Open in browser: http://localhost:5173

You should see the FloodSense login page with no console errors.

### 3. Check Browser Console
Press F12 → Console tab
- ✅ No CORS errors
- ✅ Socket.IO connected successfully
- ✅ API requests working

### 4. Check Network Tab
Press F12 → Network tab
- ✅ Requests to `/api/*` return 200 status
- ✅ No 401 or 403 errors
- ✅ Cookies are being set

## 📋 Configuration Summary

### Backend (server/.env)
```env
MONGODB_URI=mongodb://localhost:27017/floodsense
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
UPLOAD_PATH=./uploads
SEED_ADMIN=false
```

### Frontend (client/.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=FloodSense
VITE_APP_VERSION=1.0.0
```

## 🐛 Troubleshooting

### CORS Error: "Access-Control-Allow-Origin"
**Symptoms:** Browser console shows CORS error
**Solution:**
1. Check `server/.env` has `CLIENT_URL=http://localhost:5173`
2. Restart backend server
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+F5)

### MongoDB Connection Error
**Symptoms:** Backend shows "MongoDB connection error"
**Solution:**
```powershell
# Check if MongoDB is running
mongosh --eval "db.version()"

# If not running, start MongoDB
# (Method depends on your installation)
mongod
# OR
net start MongoDB
```

### Port Already in Use
**Symptoms:** "EADDRINUSE: address already in use"
**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use different port in server/.env
PORT=5001
```

### Socket.IO Connection Failed
**Symptoms:** Console shows "WebSocket connection failed"
**Solution:**
1. Ensure backend is running first
2. Check `client/.env` has correct `VITE_SOCKET_URL`
3. Check browser console for specific error
4. Verify no firewall blocking WebSocket connections

### 401 Unauthorized on API Calls
**Symptoms:** API requests return 401 status
**Solution:**
1. Clear browser cookies
2. Try logging in again
3. Check JWT_SECRET is set in `server/.env`
4. Verify `withCredentials: true` in API config

## 🔐 Creating Admin Account

To create an admin account for testing:

1. Edit `server/.env`:
   ```env
   SEED_ADMIN=true
   ADMIN_EMAIL=admin@floodsense.local
   ADMIN_PASSWORD=admin123
   ```

2. Restart the server:
   ```powershell
   cd server
   npm start
   ```

3. Admin account will be created automatically

4. Set `SEED_ADMIN=false` to prevent re-seeding

5. Login with:
   - Email: `admin@floodsense.local`
   - Password: `admin123`

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (localhost:5173)              │
│  ┌────────────────────────────────────────────────────┐ │
│  │  React App (Vite)                                  │ │
│  │  - AuthContext (manages user state)                │ │
│  │  - SocketContext (real-time updates)               │ │
│  │  - API Service (axios with credentials)            │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/WebSocket
                          │ (CORS enabled)
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend Server (localhost:5000)             │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Express + Socket.IO                               │ │
│  │  - CORS: allows localhost:5173                     │ │
│  │  - JWT auth with httpOnly cookies                  │ │
│  │  - REST API (/api/*)                               │ │
│  │  - Real-time events (Socket.IO)                    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Mongoose
                          ▼
┌─────────────────────────────────────────────────────────┐
│              MongoDB (localhost:27017)                   │
│  - Database: floodsense                                  │
│  - Collections: users, reports, fallbackplaces           │
└─────────────────────────────────────────────────────────┘
```

## 🎉 What's Working Now

✅ **CORS properly configured** - Frontend can make requests to backend
✅ **Cookie-based authentication** - JWT tokens stored securely
✅ **Socket.IO real-time updates** - Live notifications working
✅ **File uploads** - Image uploads for flood reports
✅ **Geospatial queries** - Location-based report filtering
✅ **Role-based access** - User/Admin/SuperAdmin permissions
✅ **Environment configuration** - Proper .env setup
✅ **Development workflow** - Easy startup with scripts
✅ **Multi-language support** - Full English & Tagalog translations for all pages

## 📝 Next Steps

1. **Start the servers** using `.\start-dev.ps1`
2. **Create admin account** (see section above)
3. **Test the application**:
   - Register a new user
   - Login
   - Create a flood report
   - View reports on map
   - Test admin features
4. **Check real-time updates**:
   - Open app in two browser windows
   - Create report in one window
   - See it appear in the other window

## 💡 Development Tips

- **Hot Reload**: Both servers support hot reload - changes reflect automatically
- **API Testing**: Use http://localhost:5000/api/ping to verify backend
- **Database Inspection**: Use MongoDB Compass or `mongosh` to inspect data
- **Logs**: Check terminal windows for detailed logs
- **Network Tab**: Use browser DevTools to debug API calls

## 📞 Support

If you encounter issues:
1. Run `.\test-connection.ps1` to diagnose
2. Check the troubleshooting section above
3. Review server/client terminal logs
4. Verify all environment variables are set correctly

---

**Last Updated:** 2026-03-28
**FloodSense Version:** 1.0.0
