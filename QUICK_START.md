# FloodSense - Quick Start Guide

## ✅ What Was Fixed

Your CORS and connection issues have been resolved! Here's what was fixed:

1. ✅ **CORS Configuration** - Proper origin validation with logging
2. ✅ **Environment Files** - Created `.env` files for both client and server
3. ✅ **Port Configuration** - Standardized on port 5173 for frontend
4. ✅ **Socket.IO CORS** - Matching configuration with HTTP CORS
5. ✅ **Circular Dependencies** - Fixed SocketContext dependency issue

## 🚀 Start Your Application (3 Steps)

### Step 1: Verify MongoDB is Running
```powershell
mongosh --eval "db.version()"
```
✅ If you see a version number, MongoDB is running!  
❌ If not, start MongoDB first

### Step 2: Start Both Servers
```powershell
.\start-dev.ps1
```
This will:
- Check your environment files
- Start backend on http://localhost:5000
- Start frontend on http://localhost:5173
- Open both in separate windows

### Step 3: Open Your Browser
Navigate to: **http://localhost:5173**

You should see the FloodSense login page with **NO CORS ERRORS** in the console!

## 🧪 Test Your Setup

Run the automated test:
```powershell
.\test-connection.ps1
```

This will verify:
- ✅ MongoDB connection
- ✅ Backend API responding
- ✅ Frontend running
- ✅ CORS configured correctly
- ✅ Environment files present

## 🔐 Create Admin Account

1. Edit `server\.env` and set:
   ```env
   SEED_ADMIN=true
   ```

2. Restart the backend server

3. Login with:
   - **Email:** admin@floodsense.local
   - **Password:** admin123

4. Set `SEED_ADMIN=false` after first login

## 📋 Manual Start (Alternative)

If you prefer to start servers manually:

**Terminal 1 - Backend:**
```powershell
cd server
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd client
npm run dev
```

## ✅ Verification Checklist

Open http://localhost:5173 and check:

- [ ] Page loads without errors
- [ ] No CORS errors in browser console (F12)
- [ ] Can see login/register page
- [ ] Backend health check works: http://localhost:5000/api/ping
- [ ] Socket.IO connects (check console for "Socket connected")

## 🐛 Troubleshooting

### "MongoDB connection error"
```powershell
# Check if MongoDB is running
mongosh --eval "db.version()"

# If not, start it
mongod
# OR
net start MongoDB
```

### "Port already in use"
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### CORS Errors Still Appearing
1. Check `server\.env` has `CLIENT_URL=http://localhost:5173`
2. Restart backend server
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+F5)

### Frontend Not Loading
1. Check frontend is on port 5173: http://localhost:5173
2. Check `client\.env` has correct API URL
3. Look for errors in frontend terminal window

## 📚 Additional Resources

- **Detailed Setup:** [SETUP.md](SETUP.md)
- **All Fixes Applied:** [FIXES_APPLIED.md](FIXES_APPLIED.md)
- **Main Documentation:** [README.md](README.md)

## 🎉 You're Ready!

Your FloodSense application is now properly configured and ready for development!

**Next Steps:**
1. Register a new user account
2. Create a flood report
3. Test the map functionality
4. Explore admin features (if you created admin account)

---

**Need Help?** Check the troubleshooting section above or review the detailed documentation in SETUP.md and FIXES_APPLIED.md.
