import { io } from "socket.io-client";

// In development, the socket connects to the same origin (Vite proxy/Express server)
export const socket = io(window.location.origin, {
  autoConnect: true,
});
