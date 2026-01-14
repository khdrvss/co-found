import { createClient, RedisClientType } from 'redis';
import logger from './logger';

let redisClient: RedisClientType | null = null;
let connecting = false;

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_URL || '';
  if (!url) {
    logger.info('REDIS_URL not set; skipping Redis client initialization');
    return null;
  }

  if (connecting) {
    // wait until existing connection attempt completes
    while (connecting && !redisClient) {
      await new Promise((r) => setTimeout(r, 50));
    }
    return redisClient;
  }

  try {
    connecting = true;
    const client = createClient({ url });
    client.on('error', (err) => logger.warn('Redis client error', { err }));
    await client.connect();
    redisClient = client;
    logger.info('Redis client connected');
    return redisClient;
  } catch (err) {
    logger.warn('Failed to connect to Redis', { err });
    return null;
  } finally {
    connecting = false;
  }
}

export async function closeRedisClient() {
  if (!redisClient) return;
  try {
    await redisClient.disconnect();
    redisClient = null;
    logger.info('Redis client disconnected');
  } catch (err) {
    logger.warn('Error disconnecting Redis client', { err });
  }
}

export function isRedisAvailable() {
  return !!redisClient && (redisClient as any).isOpen;
}
