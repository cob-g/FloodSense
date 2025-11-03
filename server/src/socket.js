// Socket.IO instance - separate module to avoid circular dependencies
let io = null;

export const initializeSocket = (socketInstance) => {
  io = socketInstance;
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

export { io };
