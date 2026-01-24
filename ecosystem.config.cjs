// PM2 Ecosystem Configuration for co-found.uz
// Run with: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'cofound-api',
      script: './node_modules/.bin/tsx',
      args: 'src/server/index.ts',
      cwd: '/home/ubuntu/projects/cofound/co-found',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
