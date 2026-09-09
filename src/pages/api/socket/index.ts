import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    console.log("⚡ Initializing Socket.io Server...");
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      socket.on("JOIN_USER_ROOM", (userId: string) => {
        if (userId) {
          socket.join(userId);
          console.log(`User joined room: ${userId}`);
        }
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
