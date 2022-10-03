import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
    socket.join("room");
  // join a room
    socket.on("join", ({roomid, name, password}) => {
        console.log({roomid, name, password});
      });

  // send message
  socket.on("sendMessage", ({}) => {
    
  })
});


httpServer.listen(3000);