import { BaseReturn, IRoom } from "../models/types";
import { getRedis } from "../util/redis";
import { getRoom } from "./rooms";

export const syncRoom = async (roomName: string, data: Partial<IRoom>): Promise<BaseReturn<IRoom>> => {
    // Update the room in redis
    const room = await getRoom(roomName);
    if (room.error) return room;
    const db = getRedis();
    const newRoom = { ...room.data, ...data };
    await db.set(roomName, JSON.stringify(newRoom));
    return { data: newRoom };
}