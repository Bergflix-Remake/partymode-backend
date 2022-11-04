import { Socket } from "socket.io";
import { createLogger } from "../util/log";
import { createRedis } from "../util/redis";
import { joinRoom } from "./joinRoom";

export const createRoom = async (owner: Socket) => {
    const logger = createLogger('createRoom');
    const redis = await createRedis('createRoom');
    logger.info(`🧠 Creating room for ${owner.id}`);
    const roomKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    logger.debug(`🔑 Room key: ${roomKey}`);
    await redis.json.set(roomKey, "$", { users: [], owner: owner.id });
    await redis.disconnect();
    await joinRoom(owner, roomKey);
    return;
}