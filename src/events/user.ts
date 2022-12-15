import axios from "axios";
import { BaseReturn, IUser } from "../models/types";
import logger from "../util/logger";
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
    const user = JSON.parse(userData) as IUser;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, provider, confirmed, blocked, createdAt, updatedAt, ...userWithoutPrivateData } = user;
    return { data: userWithoutPrivateData }
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
    const userData = await axios.get('https://api.bergflix.de/api/users/me', {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    }).catch((err) => {
        logger.error(err);
        return {
            status: 500,
            data: {}
        }
    });
    if (userData.status === 200) {
        const user = userData.data;
        await db.set(`users:${socketId}`, JSON.stringify(user));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { email, provider, confirmed, blocked, createdAt, updatedAt, ...userWithoutPrivateData } = user;
        return { data: userWithoutPrivateData }
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
    if (user.data) return user;
    return await connectUser(socketId, token);
}

export const removeUser = async (socketId: string): Promise<BaseReturn<string>> => {
    const db = getRedis();
    const res = await db.del(`users:${socketId}`);
    if (res === 1) return { data: "OK" };
    return {
        error: {
            message: 'User not found!',
            code: 404,
        }
    }
}