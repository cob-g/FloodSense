# FloodSense Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on port 27017)
- npm or yarn

## Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Edit .env file with your configuration:**
   - Ensure `MONGODB_URI` points to your MongoDB instance
   - Set a secure `JWT_SECRET`
   - Set `CLIENT_URL=http://localhost:5173` for development

5. **Start the server:**
   ```bash
   npm start
   ```
   
   The server should start on `http://localhost:5000`

## Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Verify .env configuration:**
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The client should start on `http://localhost:5173`

## Verification

1. **Check backend health:**
   Open `http://localhost:5000/api/ping` in your browser
   You should see: `{"message":"FloodSense API is running!","timestamp":"...","status":"healthy","version":"1.0.0"}`

2. **Check frontend:**
   Open `http://localhost:5173` in your browser
   You should see the FloodSense login page

3. **Check browser console:**
   - Open Developer Tools (F12)
   - Look for any CORS errors (there should be none)
   - Check Network tab for failed requests

## Common Issues

### CORS Errors
- Ensure backend .env has `CLIENT_URL=http://localhost:5173`
- Ensure frontend is running on port 5173
- Check that both servers are running

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check your MongoDB service
- Verify `MONGODB_URI` in server/.env matches your MongoDB setup
- Default: `mongodb://localhost:27017/floodsense`

### Socket Connection Failed
- Check that `VITE_SOCKET_URL` in client/.env matches your backend URL
- Ensure backend is running before starting frontend
- Check browser console for Socket.IO connection errors

### Port Already in Use
- Backend (5000): Stop any other services using port 5000
- Frontend (5173): Stop any other Vite instances
- Use `netstat -ano | findstr :5000` (Windows) to find processes using ports

## Admin Account

To create an admin account:

1. Set `SEED_ADMIN=true` in server/.env
2. Configure admin credentials in .env:
   ```
   ADMIN_EMAIL=admin@floodsense.local
   ADMIN_PASSWORD=admin123
   ```
3. Restart the server
4. Admin account will be created automatically
5. Set `SEED_ADMIN=false` after first run

## Development Workflow

1. Start MongoDB
2. Start backend server (terminal 1): `cd server && npm start`
3. Start frontend dev server (terminal 2): `cd client && npm run dev`
4. Open `http://localhost:5173` in browser

## Production Deployment

See individual README files in `/server` and `/client` directories for production deployment instructions.
