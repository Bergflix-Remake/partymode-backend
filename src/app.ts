import logger from './util/logger';
import * as socketio from 'socket.io';
import { joinRoom } from './events/rooms';
import { authenticateUser, getUser, removeUser } from './events/user';
import { config } from 'dotenv';
config();

const io = new socketio.Server(3000);

io.on('connection', (socket) => {
  logger.info(`Socket ${socket.id} connected`);
  const leaveAllRooms = async () => {
    for (const room of socket.rooms.keys()) {
      if (room === socket.id) continue;
      socket.emit('left', { data: room });
      const user = await getUser(socket.id);
      socket.broadcast.to(room).emit('disconnected', { data: { socket: socket.id, user: user.data } });
      socket.leave(room);
    }
  };

  // Join a room
  socket.on('join', async (roomName: string) => {
    await leaveAllRooms();
    // Join the new room
    const room = await joinRoom(roomName, socket.id)
    if (room.error) {
      logger.error(room.error.message);
      socket.emit('error', room.error); // { message: string, code: number }
      return;
    }
    socket.join(roomName);
    logger.info(`Socket ${socket.id} joined room ${roomName}`);
    socket.emit('joined', { data: room.data });
    const user = await getUser(socket.id);
    socket.broadcast.to(roomName).emit('connected', { data: { socket: socket.id, user: user.data } });
  });

  // Leave a room
  socket.on('leave', leaveAllRooms);

  // Disconnect
  socket.on('disconnect', async () => {
    await leaveAllRooms();
    await removeUser(socket.id);
    logger.info(`Socket ${socket.id} disconnected`);
  })

  socket.on('authenticate', async (token: string) => {
    const user = await authenticateUser(token, socket.id);
    if (user.error) {
      logger.error(user.error.message);
      socket.emit('error', user.error); // { message: string, code: number }
      return;
    }
    socket.emit('authenticated', user);
  });
});