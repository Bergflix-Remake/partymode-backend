import { createClient } from "redis";
import { createLogger } from "./log";

export const createRedis = async (name: string, url?: string) => {
    const logger = createLogger(`redis:${name}`);
    const client = createClient({
        url: url ? url : "redis://localhost:6379",
    });
    client.on('error', (err) => logger.error("💥 Redis error: " + err));
    client.on('connect', () => logger.info("🔌 Redis connected"));
    client.on('disconnect', () => logger.info("🔌 Redis disconnected"));
    await client.connect();
    return client;
};