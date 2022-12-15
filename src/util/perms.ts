import { BaseReturn, IRoom, IRoomPermissions } from "../models/types";
import { getRoom } from "../events/rooms";
import { getUser } from "../events/user";

export const requiredPerms = (syncData: Partial<IRoom>): BaseReturn<Partial<IRoomPermissions>> => {
    return { data: {
        name: !!syncData.name,
        queue: !!syncData.queue,
        owner: !!syncData.owner,
        video: !!syncData.currentVideo,
        time: !!syncData.currentTime,
        playback: !!syncData.playing,
        permissions: !!syncData.permissions,
    }}
}

export const checkPerms = async (syncData: Partial<IRoom>, roomName: string, socketId: string): Promise<BaseReturn<boolean>> => {
    const room = await getRoom(roomName);
    const required = requiredPerms(syncData);
    const user = await getUser(socketId);
    if (required.error || room.error) return { error: required.error || room.error };
    if (room.data.owner === socketId) return { data: true };
    const reqPerms = required.data;
    const roomPerms = user.data ? room.data.permissions.user : room.data.permissions.guest;
    for (const perm in reqPerms) {
        if (reqPerms[perm] && !roomPerms[perm]) return { error: { message: "You do not have permission to do that!", code: 403 } };
    }
    return { data: true };
}
