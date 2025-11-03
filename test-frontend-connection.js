// Quick test to verify CORS and Socket.IO are working
// Run this in browser console after logging in

// Test 1: API connection
fetch('http://localhost:5000/api/ping')
  .then(r => r.json())
  .then(data => console.log('✅ API Test:', data))
  .catch(err => console.log('❌ API Error:', err));

// Test 2: Socket.IO connection
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('✅ Socket.IO Connected'));
socket.on('connect_error', (err) => console.log('❌ Socket.IO Error:', err));
socket.on('update', (data) => console.log('📊 Live Update:', data));
