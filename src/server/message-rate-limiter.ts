import { RateLimiterRedis } from 'rate-limiter-flexible';
import logger from './logger';
import { Request, Response, NextFunction } from 'express';
import { mutationLimiter } from './rate-limit';
import { getRedisClient } from './redisClient';
import { rateLimitRejections } from './metrics';

let redisLimiter: any = null;
let redisConnected = false;

async function initRedisLimiter() {
  try {
    const client = await getRedisClient();
    if (!client) return;
    redisLimiter = new RateLimiterRedis({
      storeClient: client as any,
      points: 30, // 30 messages
      duration: 60, // per 60 seconds
      keyPrefix: 'rl:msg',
    });
    redisConnected = true;
    logger.info('Redis rate limiter initialized');
  } catch (err) {
    logger.warn('Failed to initialize Redis rate limiter', { err });
  }
}

// Initialize in background; don't await at import time
void initRedisLimiter();

export const messageRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Prefer per-user limits when authenticated
    const key = ((req as any).user && (req as any).user.userId) ? `user:${(req as any).user.userId}` : req.ip;

    if (redisConnected && redisLimiter) {
      try {
        await redisLimiter.consume(key);
        return next();
      } catch (rej) {
        const retrySecs = Math.round((rej.msBeforeNext || 0) / 1000) || 1;
        res.setHeader('Retry-After', String(retrySecs));
        try { rateLimitRejections.inc(); } catch (e) {}
        return res.status(429).json({ error: 'Rate limit exceeded', retryAfter: retrySecs });
      }
    }

    // Fall back to in-process express-rate-limit middleware
    return mutationLimiter(req as any, res as any, next as any);
  } catch (err) {
    logger.warn('Rate limiter middleware error', { err });
    return next();
  }
};
