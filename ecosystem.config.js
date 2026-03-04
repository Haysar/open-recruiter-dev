// pm2 process manager config — used on Infomaniak Jelastic (and any pm2-based host)
// Usage: pm2 start ecosystem.config.js
// After first start: pm2 save  (persists across server reboots)
module.exports = {
  apps: [
    {
      name: "open-recruiter",
      script: "node_modules/.bin/next",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
}
