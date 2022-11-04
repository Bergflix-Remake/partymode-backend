import { Socket } from "socket.io";
import { createLogger } from "../util/log";
import { createRedis } from "../util/redis";
import { leaveRoom } from "./leaveRoom";

export const joinRoom = async (user: Socket, roomKey: string) => {
    const logger = createLogger('joinRoom');
    const redis = await createRedis('joinRoom');
    await leaveRoom(user);
    const room = await redis.json.get(roomKey);
    if (!room) {
        logger.error(`🔑 Room ${roomKey} does not exist`);
        user.emit('error', 'Room does not exist');
        return;
    }
    logger.info(`🧠 Joining room ${roomKey} for ${user.id}`);
    await redis.json.arrAppend(roomKey, "users", user.id);
    const users = await redis.json.get(roomKey, { path: "users" });
    await redis.disconnect();
    user.join(roomKey);
    user.emit('joined', roomKey, users);
}