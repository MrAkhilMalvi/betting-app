// src/socket/game.socket.ts
import { io } from "socket.io-client";

export const socket = io("http://192.168.0.58:3000", {
  withCredentials: true,
});