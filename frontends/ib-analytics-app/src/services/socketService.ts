// services/socketService.ts
import { io, Socket } from "socket.io-client";
let socket: Socket | null = null;

export const connectSocket = (url = "/") => {
  if (!socket) {
    socket = io(url, { transports: ["websocket"] });
    console.log("Socket connected:", url);
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log("Socket disconnected");
    socket.disconnect();
    socket = null;
  }
};
