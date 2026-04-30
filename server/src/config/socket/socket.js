let ioInstance = null;

// set once (from server)
export const setIO = (io) => {
  ioInstance = io;
};

// use anywhere
export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized");
  }
  return ioInstance;
};
