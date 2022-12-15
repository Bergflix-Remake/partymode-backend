import logger from './util/logger';
import { Server } from 'socket.io';
import { joinRoom } from './events/rooms';
import { authenticateUser, getUser, removeUser } from './events/user';
import { config } from 'dotenv';
import { IRoom } from './models/types';
import { checkPerms } from './util/perms';
import { syncRoom } from './events/sync';
import e from 'express';
import http from 'http';
config();

const app = e();
const server = http.createServer(app);

app.get('/', (req, res) => {
  // serve html from /static
  res.sendFile(__dirname + '/static/index.html');
});

const io = new Server(server);

io.on('connection', (socket) => {
  logger.info(`Socket ${socket.id} connected`);
  const leaveAllRooms = async (roomName?: string, callback?) => {
    const rooms = [];
    for (const room of socket.rooms.keys()) {
      if (room === socket.id) continue;
      rooms.push(room);
      const user = await getUser(socket.id);
      socket.broadcast.to(room).emit('left', { data: { socket: socket.id, user: user.data } });
      socket.leave(room);
    }
    if (callback) callback({ data: { rooms } })
  };

  const checkCb = (callback) => {
    if (typeof callback !== 'function') {
      logger.error('Callback is not a function');
      socket.emit('error', { error: 'This event requires an Acknowledgement. Please check your code! https://socket.io/docs/v3/emitting-events/#acknowledgements' });
      return false;
    }
    return true;
  }

  socket.on('join', async (roomName: string, callback) => {
    if (!checkCb(callback)) return;
    await leaveAllRooms();
    // Join the new room
    const room = await joinRoom(roomName, socket.id)
    if (room.error) {
      logger.error(room.error.message);
      callback({ error: room.error });
      return;
    }
    socket.join(roomName);
    logger.info(`Socket ${socket.id} joined room ${roomName}`);
    callback({ data: room.data });
    const user = await getUser(socket.id);
    socket.broadcast.to(roomName).emit('join', { data: { socket: socket.id, user: user.data } });
  });

  // Leave a room
  socket.on('leave', leaveAllRooms);

  // Disconnect
  socket.on('disconnect', async () => {
    await leaveAllRooms();
    await removeUser(socket.id);
    logger.info(`Socket ${socket.id} disconnected`);
  })

  // Authenticate
  socket.on('authenticate', async (token: string, callback) => {
    if (!checkCb(callback)) return;
    const user = await authenticateUser(token, socket.id);
    if (user.error) logger.error(user.error.message);
    callback(user);
  });

  // Sync event
  socket.on('sync', async (data: Partial<IRoom>, manual?, callback?) => {
    if (!checkCb(callback)) return;
    // Get the room the user is in
    const roomName = await Array.from(socket.rooms.keys())[1];
    const isPermitted = await checkPerms(data, roomName, socket.id);
    const room = await syncRoom(roomName, data);
    const err = isPermitted.error || room.error
    if (err) {
      logger.error(err.message);
      callback({ error: err })
      return;
    }
    const newData = { data: { room: room.data, manual } }
    socket.to(roomName).emit('sync', newData);
    callback(newData);
  });

  // Message event
  socket.on('message', async (message: string, callback) => {
    if (!checkCb(callback)) return;
    // Get the room the user is in
    const roomName = await Array.from(socket.rooms.keys())[1];
    const user = await getUser(socket.id);
    const data = { data: { socket: socket.id, user: user.data, message } };
    socket.to(roomName).emit('message', data);
    callback(data);
  });
});

server.listen(process.env.PORT, () => {
  logger.info('Server listening on port 3000');
});