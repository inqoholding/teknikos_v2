module.exports = {
  apps: [
    {
      name: "teknikos-backend",
      cwd: "/var/www/teknikos/backend",
      script: "dist/src/server.js",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
