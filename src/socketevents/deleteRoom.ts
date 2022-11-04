import { Socket } from "socket.io";
import { io } from "../app";
import { createLogger } from "../util/log";
import { createRedis } from "../util/redis";
import { leaveRoom } from "./leaveRoom";

export const deleteRoom = async (owner: Socket, roomKey: string) => {
    const logger = createLogger('deleteRoom');
    const redis = await createRedis('deleteRoom');
    const roomOwner = await redis.json.get(roomKey, { path: "owner" });
    if (!roomOwner) {
        logger.error(`🔑 Room ${roomKey} does not exist`);
        owner.emit('error', 'Room does not exist');
        return;
    }
    if (roomOwner !== owner.id) {
        logger.error(`🔑 Room ${roomKey} is not owned by ${owner.id}`);
        owner.emit('error', 'Room is not owned by you');
        return;
    }
    io.socketsLeave(roomKey);
    logger.info(`🧠 Deleting room ${roomKey} for ${owner.id}`);
    await redis.del(roomKey);
    await redis.disconnect();
    owner.emit('deleted', roomKey);
    return;
}