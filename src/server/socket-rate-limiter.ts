import { RateLimiterRedis } from 'rate-limiter-flexible';
import { getRedisClient } from './redisClient';
import logger from './logger';

let typingLimiter: any = null;
let deliveredLimiter: any = null;
let initialized = false;

export async function initSocketLimiters() {
  if (initialized) return;
  try {
    const client = await getRedisClient();
    if (client) {
      typingLimiter = new RateLimiterRedis({ storeClient: client as any, points: 8, duration: 8, keyPrefix: 'rl:typing' });
      deliveredLimiter = new RateLimiterRedis({ storeClient: client as any, points: 300, duration: 60, keyPrefix: 'rl:delivered' });
      logger.info('Socket rate limiters initialized using Redis');
    } else {
      // Fallback to in-memory token buckets (per-process)
      typingLimiter = null;
      deliveredLimiter = null;
      logger.warn('Redis not available for socket rate limiters; falling back to per-process limits');
    }
    initialized = true;
  } catch (err) {
    logger.warn('Failed to initialize socket rate limiters', { err });
  }
}

// Simple in-memory fallback counters
const inMemoryBuckets: Map<string, { count: number; resetAt: number }[]> = new Map();

function inMemoryConsume(key: string, max: number, windowMs: number) {
  const now = Date.now();
  let arr = inMemoryBuckets.get(key) || [];
  arr = arr.filter((entry) => entry.resetAt > now);
  if (arr.length >= max) return false;
  arr.push({ count: 1, resetAt: now + windowMs });
  inMemoryBuckets.set(key, arr);
  return true;
}

export async function consumeTyping(userId: string) {
  const key = `user:${userId}`;
  if (typingLimiter) {
    try {
      await typingLimiter.consume(key);
      return true;
    } catch (rej) {
      return false;
    }
  }
  return inMemoryConsume(key + ':typing', 8, 8000);
}

export async function consumeDelivered(userId: string) {
  const key = `user:${userId}`;
  if (deliveredLimiter) {
    try {
      await deliveredLimiter.consume(key);
      return true;
    } catch (rej) {
      return false;
    }
  }
  return inMemoryConsume(key + ':delivered', 300, 60_000);
}
