import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { createLogger } from "./util/log";
import { createRoom } from "./socketevents/createRoom";
import { joinRoom } from "./socketevents/joinRoom";
import { leaveRoom } from "./socketevents/leaveRoom";

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer);
const logger = createLogger("app");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  logger.info("👤 New connection: " + socket.id);
  socket.join("homeroom");
  socket.on("disconnect", () => {
    logger.info("👋 Disconnected: " + socket.id);
    leaveRoom(socket);
  });
  socket.on("create", async () => await createRoom(socket));
  socket.on("join", async (roomKey: string) => await joinRoom(socket, roomKey));
});

httpServer.listen(3000, () => {
  logger.info("🚀 Server started on port http://localhost:3000");
});
