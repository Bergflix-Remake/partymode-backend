import { BaseReturn, IRoom } from "../models/types";
import partymodeConfig from "../partymode.config";
import { getRedis } from "../util/redis";
import { getUser } from "./user";

/**
 * Get the room data from redis. Can be used to check if a room exists.
 * @param roomName Name of the room
 * @returns {BaseReturn<IRoom>} Returns the room data if it exists, otherwise returns an error.
 * @example
 * const room = await getRoom('test');
 * if (room.error) {
 *   console.log(room.error.message);
 * } else {
 *  console.log(room.data);
 * }
 */
export const getRoom = async (roomName: string): Promise<BaseReturn<IRoom>> => {
    const db = getRedis();
    const roomData = await db.get(`rooms:${roomName}`);
    if (roomData) return { data: JSON.parse(roomData) as IRoom };
    return {
        error: {
            message: 'Room not found!',
            code: 404,
        }
    };
}

/**
 * Create a new room.
 * Note that the user has to be logged in to create a room. Function DOES return an error if the user is not logged in.
 * @param roomName Name of the room
 * @param owner Socket ID of the owner
 * @returns {BaseReturn<IRoom>} Returns the room data if it was created successfully, otherwise returns an error.
 * @example
 * const room = await createRoom('test', '1234');
 * if (room.error) {
 *    console.log(room.error.message);
 * } else {
 *   console.log(room.data);
 * }
 */
export const createRoom = async (roomName: string, owner: string): Promise<BaseReturn<IRoom>> => {
    const db = getRedis();
    const room: IRoom = {
        name: roomName,
        queue: [],
        owner,
        currentVideo: '',
        currentTime: 0,
        playing: false,
        permissions: partymodeConfig.defaults.room_perms,
    };
    if (!(await getUser(owner)).data) return { error: {
        message: 'You cant create a room without being logged in!',
        code: 401,
    } };
    if ((await getRoom(roomName)).data) return { error: {
        message: 'Room already exists!',
        code: 409,
    } };
    await db.set(`rooms:${roomName}`, JSON.stringify(room));
    return { data: room };
}

/**
 * Join a room. If the room doesn't exist, it will be created.
 * @param roomName Name of the room
 * @param socketId Socket ID of the user
 * @returns {BaseReturn<IRoom>} Returns the room data if it was joined successfully, otherwise returns an error.
 * @example
 * const room = await joinRoom('test', '1234');
 * if (room.error) {
 *   console.log(room.error.message);
 * } else {
 *  console.log(room.data);
 * }
 */
export const joinRoom = async (roomName: string, socketId: string): Promise<BaseReturn<IRoom>> => {
    const room = await getRoom(roomName);
    if (room.data) return room;
    return await createRoom(roomName, socketId);
}
