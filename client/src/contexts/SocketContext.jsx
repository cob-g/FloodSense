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
    if (!user) {
      if (socket.connected) {
        socket.disconnect();
        console.log('Socket disconnected (user logged out)');
      }
      setConnected(false);
      return;
    }

    // Register listeners FIRST before connecting to avoid missing the connect event
    const handleConnect = () => {
      console.log('Socket connected');
      setConnected(true);
      if (user.barangay) {
        joinBarangay(user.barangay);
      }
    };
    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setConnected(false);
    };
    const handleConnectError = (err) => {
      console.log('Socket connect_error:', err?.message || err);
      setConnected(false);
    };
    const handleJoinedBarangay = (data) => console.log('Joined barangay:', data);
    const handleNewReport = (data) => {
      console.log('New report received:', data);
      queryClient.invalidateQueries(['reports']);
    };
    const handleReportValidated = (data) => {
      console.log('Report validated:', data);
      queryClient.invalidateQueries(['reports']);
    };
    const handleReportRejected = (data) => {
      console.log('Report rejected:', data);
      queryClient.invalidateQueries(['reports']);
    };
    const handleReportDeleted = (data) => {
      console.log('Report deleted:', data);
      queryClient.invalidateQueries(['reports']);
    };
    const handleReportUpdate = (data) => {
      console.log('Report update:', data);
      queryClient.invalidateQueries(['reports']);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('joined-barangay', handleJoinedBarangay);
    socket.on('new-report', handleNewReport);
    socket.on('report-validated', handleReportValidated);
    socket.on('report-rejected', handleReportRejected);
    socket.on('report-deleted', handleReportDeleted);
    socket.on('report-update', handleReportUpdate);

    // Connect or sync state after listeners are set up
    if (socket.connected) {
      setConnected(true);
      if (user.barangay) {
        joinBarangay(user.barangay);
      }
    } else {
      socket.connect();
      console.log('Socket connecting...');
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('joined-barangay', handleJoinedBarangay);
      socket.off('new-report', handleNewReport);
      socket.off('report-validated', handleReportValidated);
      socket.off('report-rejected', handleReportRejected);
      socket.off('report-deleted', handleReportDeleted);
      socket.off('report-update', handleReportUpdate);
    };
  }, [user, queryClient]);

  return (
    <SocketContext.Provider value={{ connected, socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
