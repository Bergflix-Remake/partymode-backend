import { createClient, RedisClientType } from 'redis';
import logger from './logger';

const createRedis = () => {
    const redisClient = createClient({
        url: process.env.REDIS_URL,
    });

    redisClient.on('error', (err) => {
        logger.error(`Redis error: ${err}`);
    });

    redisClient.on('connect', () => {
        logger.info('Connected to Redis');
    });

    redisClient.connect()

    return redisClient;
}

let redis: unknown;

export const getRedis = (): RedisClientType => {
    if (!redis) {
        redis = createRedis();
    }

    return redis as RedisClientType;
}