import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const messagesSent = new client.Counter({
  name: 'cofound_messages_sent_total',
  help: 'Total private messages sent',
  registers: [register],
});

export const messagesRead = new client.Counter({
  name: 'cofound_messages_read_total',
  help: 'Total private messages marked as read',
  registers: [register],
});

export const rateLimitRejections = new client.Counter({
  name: 'cofound_rate_limit_rejections_total',
  help: 'Total rate limit rejections',
  registers: [register],
});

export const socketConnections = new client.Gauge({
  name: 'cofound_socket_connections',
  help: 'Current number of socket connections',
  registers: [register],
});

export const socketTyping = new client.Counter({
  name: 'cofound_socket_typing_total',
  help: 'Number of typing events received',
  registers: [register],
});

export const socketTypingRejected = new client.Counter({
  name: 'cofound_socket_typing_rejected_total',
  help: 'Number of typing events rejected by limiter',
  registers: [register],
});

export const socketDelivered = new client.Counter({
  name: 'cofound_socket_delivered_total',
  help: 'Number of delivered acknowledgements received',
  registers: [register],
});

export const httpErrors = new client.Counter({
  name: 'cofound_http_errors_total',
  help: 'Number of HTTP 5xx responses emitted by the server',
  registers: [register],
});

export default register;
