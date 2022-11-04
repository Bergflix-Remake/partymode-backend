import { Socket } from "socket.io";
import { createLogger } from "../util/log";
import { createRedis } from "../util/redis";

export const leaveRoom = async (user: Socket) => {
    const logger = createLogger('leaveRoom');
    const redis = await createRedis('leaveRoom');
    const rooms = user.rooms;
    for (const room of rooms) {
        if (room === 'homeroom' || room === user.id) continue;
        logger.info(`🧠 Leaving room ${room} for ${user.id}`);
        const index = await redis.json.arrIndex(room, "users", user.id);
        await redis.json.arrPop(room, "users", index as number);
    }
    await redis.disconnect();
    return;
}