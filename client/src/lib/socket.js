import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
    console.log('Socket connecting...');
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log('Socket disconnected');
  }
};

export const joinBarangay = (barangay) => {
  if (socket.connected && barangay) {
    socket.emit('join-barangay', barangay);
    console.log(`Joined barangay room: ${barangay}`);
  }
};

export const leaveBarangay = (barangay) => {
  if (socket.connected && barangay) {
    socket.emit('leave-barangay', barangay);
    console.log(`Left barangay room: ${barangay}`);
  }
};

export default socket;
