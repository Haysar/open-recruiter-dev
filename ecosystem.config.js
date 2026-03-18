// pm2 process manager config — used for pure hosting on Infomaniak Jelastic Cloud
// This configuration is kept for hosting purposes as requested
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