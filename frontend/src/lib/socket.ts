// lib/socket.ts
import { io } from "socket.io-client";

let socket: ReturnType<typeof io> | null = null;

export const connectSocket = (userId: string) => {
  if (!socket) {
    socket = io("http://localhost:8080", {
      query: { userId }, // join room
    });
  }
  return socket;
};
