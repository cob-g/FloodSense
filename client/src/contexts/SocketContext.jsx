import { createContext, useEffect, useState, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import socket, { joinBarangay } from '../lib/socket';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      // Connect socket
      if (!socket.connected) {
        socket.connect();
        console.log('Socket connecting...');
      }

      // Initialize connection state in case we're already connected
      setConnected(!!socket.connected);

      // Socket event listeners
      socket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        
        // Join barangay room if user has barangay
        if (user.barangay) {
          joinBarangay(user.barangay);
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.log('Socket connect_error:', err?.message || err);
        setConnected(false);
      });

      socket.on('joined-barangay', (data) => {
        console.log('Joined barangay:', data);
      });

      socket.on('new-report', (data) => {
        console.log('New report received:', data);
        // Invalidate reports query to refetch
        queryClient.invalidateQueries(['reports']);
      });

      socket.on('report-validated', (data) => {
        console.log('Report validated:', data);
        queryClient.invalidateQueries(['reports']);
      });

      socket.on('report-rejected', (data) => {
        console.log('Report rejected:', data);
        queryClient.invalidateQueries(['reports']);
      });

      socket.on('report-deleted', (data) => {
        console.log('Report deleted:', data);
        queryClient.invalidateQueries(['reports']);
      });

      socket.on('report-update', (data) => {
        console.log('Report update:', data);
        queryClient.invalidateQueries(['reports']);
      });

      // Cleanup on unmount
      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('joined-barangay');
        socket.off('new-report');
        socket.off('report-validated');
        socket.off('report-rejected');
        socket.off('report-deleted');
        socket.off('report-update');
      };
    } else {
      // Disconnect socket when user logs out
      if (socket.connected) {
        socket.disconnect();
        console.log('Socket disconnected (user logged out)');
      }
    }
  }, [user, queryClient]);

  return (
    <SocketContext.Provider value={{ connected, socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
