import axios from "axios";
import { BaseReturn, IUser } from "../models/types";
import { getRedis } from "../util/redis";

/**
 * Get user data from redis. Can be used to check if a user is logged in.
 * @param socketId Socket ID of the user
 * @returns {BaseReturn<IUser>} Returns the user data if it exists, otherwise returns an error.
 * @example
 * const user = await getUser('1234');
 * if (user.error) {
 *  console.log(user.error.message);
 * } else {
 *  console.log(user.data)
 * }
 */
export const getUser = async (socketId: string): Promise<BaseReturn<IUser>> => {
    const db = getRedis();
    const userData = await db.get(`users:${socketId}`);
    if (!userData) return {
        error: {
            message: 'User not found!',
            code: 404,
        }
    };
    return { data: JSON.parse(userData) as IUser };
}


/**
 * Connects a socket to a user account and saves the user data to redis.
 * @param socketId Socket ID of the user
 * @param token JWT token of the user
 * @returns {BaseReturn<IUser>} Returns the user data if it was connected successfully, otherwise returns an error.
 * @example
 * const user = await connectUser('1234', 'token');
 * if (user.error) {
 *  console.log(user.error.message);
 * } else {
 *  console.log(user.data);
 * }
 */
export const connectUser = async (socketId: string, token: string): Promise<BaseReturn<IUser>> => {
    const db = getRedis();
    const userData = await axios.get('https://api.bergflix.de/users/me', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    if (userData.status === 200) {
        const user = userData.data;
        await db.set(`users:${socketId}`, JSON.stringify(user));
        return { data: user }
    } else {
        return {
            error: {
                message: 'Failed to authenticate user!',
                code: 401,
            }
        }
    }
}

/**
 * Checks if socket is connected to a user account. If not, it will try to connect the user.
 * @param token JWT token of the user
 * @param socketId Socket ID of the user
 * @returns {BaseReturn<IUser>} Returns the user data if it was connected successfully, otherwise returns an error.
 */
export const authenticateUser = async (token: string, socketId: string): Promise<BaseReturn<IUser>> => {
    const user = await getUser(socketId);
    if (user.data) return { data: user.data };
    return await connectUser(socketId, token);
}