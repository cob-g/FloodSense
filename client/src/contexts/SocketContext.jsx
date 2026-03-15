import { createContext, useEffect, useState, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import socket, { joinBarangay } from '../lib/socket';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  // Tracks actual physical socket connection (regardless of auth state)
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const queryClient = useQueryClient();

  // Effect 1: manage the physical socket connection once and keep it alive
  useEffect(() => {
    const onConnect    = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onConnectError = () => setSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Keep local state in sync in case the socket connected before listeners
    // were reattached (can happen during StrictMode effect re-runs).
    setSocketConnected(socket.connected);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  // Effect 2: when user logs in and socket isn't already connected, force a
  // fresh connect — this resets any exhausted reconnection counter and handles
  // the race where the initial connect attempt failed before login.
  useEffect(() => {
    if (!user) return;

    // If already connected, immediately reflect it in local state.
    if (socket.connected) {
      setSocketConnected(true);
      return;
    }

    // If a pre-login attempt is stuck in a bad state, restart once on login.
    if (socket.active) {
      socket.disconnect();
    }

    socket.connect();
  }, [user]);

  // Effect 3: join barangay room when both user and socket are ready
  useEffect(() => {
    if (user?.barangay && socketConnected) {
      joinBarangay(user.barangay);
    }
  }, [user, socketConnected]);

  // Effect 4: listen for data events only while a user is logged in
  useEffect(() => {
    if (!user) return;

    const invalidate = () => queryClient.invalidateQueries(['reports']);

    socket.on('new-report', invalidate);
    socket.on('report-validated', invalidate);
    socket.on('report-rejected', invalidate);
    socket.on('report-deleted', invalidate);
    socket.on('report-update', invalidate);

    return () => {
      socket.off('new-report', invalidate);
      socket.off('report-validated', invalidate);
      socket.off('report-rejected', invalidate);
      socket.off('report-deleted', invalidate);
      socket.off('report-update', invalidate);
    };
  }, [user, queryClient]);

  // "connected" exposed to consumers = socket is up AND user is logged in
  const connected = socketConnected && !!user;

  return (
    <SocketContext.Provider value={{ connected, socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
