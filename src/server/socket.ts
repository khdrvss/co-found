import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import config, { getJwtSecret } from './config';
import logger from './logger';
import { socketConnections, socketTyping, socketTypingRejected, socketDelivered } from './metrics';

let io: Server | null = null;

export async function initSocket(server: http.Server) {
  if (io) return io;

  io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: config.security.allowedOrigins || '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Optional Redis adapter for horizontal scaling
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const { createAdapter } = await import('@socket.io/redis-adapter');
      const { getRedisClient } = await import('./redisClient');
      const client = await getRedisClient();
      if (client) {
        const subClient = (client as any).duplicate();
        await subClient.connect();
        io.adapter(createAdapter(client as any, subClient));
        logger.info('Socket.IO Redis adapter configured');
      } else {
        logger.warn('Redis client not available for Socket.IO adapter');
      }
    } catch (err) {
      logger.warn('Failed to configure Redis adapter for Socket.IO', { err });
    }
  }

  // Authenticate socket connections using JWT token passed via `auth` payload or Authorization header
  const JWT_SECRET = getJwtSecret();
  io.use((socket, next) => {
    try {
      const token = (socket.handshake.auth && socket.handshake.auth.token) ||
        (socket.handshake.headers && (socket.handshake.headers as any).authorization && (socket.handshake.headers as any).authorization.split(' ')[1]);

      if (!token) {
        const err = new Error('Unauthorized');
        (err as any).data = { code: 'Unauthorized' };
        return next(err);
      }

      jwt.verify(token, JWT_SECRET, (err: any, payload: any) => {
        if (err) {
          logger.warn('Socket auth JWT verification failed', { err: err?.message, tokenSnippet: String(token || '').slice(0, 40) });
          return next(new Error('Invalid token'));
        }
        // Attach minimal auth info
        socket.data.userId = payload.userId || payload.user_id || payload.id;
        socket.data.email = payload.email;
        next();
      });
    } catch (err) {
      next(err as any);
    }
  });

  // Initialize socket rate limiters (Redis-backed when available)
  try {
    const { initSocketLimiters } = await import('./socket-rate-limiter');
    await initSocketLimiters();
  } catch (err) {
    logger.warn('Failed to initialize socket limiters', { err });
  }

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    logger.info('Socket connected', { socketId: socket.id, userId });

    try { socketConnections.inc(); } catch (e) {}

    // Join user-specific room for targeted emits
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('typing', async ({ to }: { to: string }) => {
      try {
        const ok = await (await import('./socket-rate-limiter')).consumeTyping(String(userId));
        if (!ok) {
          try { socketTypingRejected.inc(); } catch (e) {}
          return;
        }
        try { socketTyping.inc(); } catch (e) {}

        if (to) {
          io?.to(`user:${to}`).emit('typing', { from: userId });
        }
      } catch (err) {
        // silent
      }
    });

    // Delivery receipt acknowledgement from client - mark message as delivered
    socket.on('message.delivered', async (payload: any) => {
      try {
        if (!(await (await import('./socket-rate-limiter')).consumeDelivered(String(userId)))) {
          try { socketTypingRejected.inc(); } catch (e) {}
          return;
        }

        const { messageId } = payload || {};
        if (!messageId) return;

        const { query } = await import('./db');
        const result = await query(
          'UPDATE private_messages SET delivered = true, delivered_at = NOW() WHERE id = $1 RETURNING sender_id, receiver_id, delivered_at',
          [messageId]
        );

        if (result.rows.length > 0) {
          const row = result.rows[0];
          // Notify the original sender that the message was delivered
          emitToUser(row.sender_id, 'message.delivered', { id: messageId, delivered_at: row.delivered_at });
          try { socketDelivered.inc(); } catch (e) {}
        }
      } catch (err) {
        logger.warn('Failed to persist delivery receipt', { err });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { socketId: socket.id, reason });
      try { socketConnections.dec(); } catch (e) {}
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
}

export function emitToUser(userId: string | number, event: string, payload: any) {
  if (!io) return false;
  try {
    io.to(`user:${userId}`).emit(event, payload);
    return true;
  } catch (err) {
    logger.warn('Failed to emit socket event', { err, userId, event });
    return false;
  }
}

export function getIo() {
  return io;
}
