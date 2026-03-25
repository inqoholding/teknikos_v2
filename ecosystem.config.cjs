module.exports = {
  apps: [
    {
      name: "teknikos-backend",
      cwd: "./backend",
      script: "dist/src/server.js",
      interpreter: "node",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
