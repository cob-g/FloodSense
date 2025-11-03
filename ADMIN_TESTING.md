# Admin Panel Testing Guide

## What Was Fixed

### 1. **Backend Crash Issue** ✅
- **Problem**: Server crashed with `ReferenceError: barangay is not defined` at line 221
- **Cause**: Misplaced code in GET `/api/reports` endpoint that tried to emit socket events
- **Fix**: Removed duplicate code and added missing `lat` parameter

### 2. **Socket.IO Not Connecting** ✅
- **Problem**: Real-time updates weren't working
- **Cause**: Socket was set to `autoConnect: false` but never explicitly connected
- **Fix**: Added `socket.connect()` in `SocketContext` when user logs in

### 3. **Reports Not Showing in Feed** ✅
- **Problem**: User feed was empty
- **Cause**: Query was filtering by user's barangay, but users might not have barangay assigned
- **Fix**: HomePage now shows all reports if user has no barangay, barangay-specific otherwise

## How to Test the Admin Workflow

### Step 1: Login as Admin
1. Open browser to `http://localhost:5173`
2. Login with:
   - Email: `admin@floodsense.local`
   - Password: `admin123`
3. Navigate to `/admin`

### Step 2: Submit a Test Report (as regular user)
1. Open a different browser or incognito window
2. Register a new user or login as existing user
3. Click the `+` button (floating action button)
4. Fill out the report form:
   - Select location on map or use "Use My Location"
   - Choose depth (Ankle/Knee/Waist/Chest)
   - Choose passability
   - Upload a photo
   - Add description
5. Submit the report
6. You should see toast: "Salamat sa ulat! Ipe-validate ng Barangay DRRM Officer."

### Step 3: Validate the Report (as admin)
1. Switch back to admin browser window
2. You should see the new report in "Pending Reports" table
3. Click the **"Validate"** button
4. Add optional notes (e.g., "Confirmed by field team")
5. Click "Confirm Validation"
6. You should see green toast: "Report validated successfully!"

### Step 4: Check Real-Time Updates
1. Switch to the user browser window
2. Go to homepage feed
3. Click "Validated" filter
4. The report you just validated should appear immediately (real-time!)

### Step 5: Test Rejection
1. Submit another report as user
2. As admin, click **"Reject"** button
3. Add reason (required): "Photo unclear, please resubmit"
4. Confirm rejection
5. Report status changes to REJECTED

## Troubleshooting

### Reports Still Not Showing?
**Check browser console** (F12) for:
- `Socket connected` message
- `Joined barangay: [name]` message
- Any errors

**Check server console** for:
- `User connected: [socket-id]`
- Reports being created successfully

### Socket Not Connecting?
1. Ensure backend is running on port 5000
2. Check `client/.env` has `VITE_SOCKET_URL=http://localhost:5000`
3. Check browser console for CORS errors

### Validation Not Working?
1. Check Network tab (F12) for PATCH request to `/api/reports/[id]/validate`
2. Ensure you're logged in as admin
3. Check server logs for errors

## Real-Time Features Status

✅ **Socket.IO connected** - Users join barangay rooms
✅ **New report broadcasts** - `new-report` event emitted
✅ **Validation broadcasts** - `report-validated` event emitted
✅ **Rejection broadcasts** - `report-rejected` event emitted
✅ **Automatic refresh** - React Query invalidates on socket events

## Next Steps

After confirming admin validation works:
1. **Phase 7: Offline Support** - Service worker, IndexedDB
2. **Phase 8: Polish** - Loading states, error boundaries, i18n
3. **Deployment** - Production environment setup
