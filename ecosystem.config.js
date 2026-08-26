// ponytail: fork mode, 1 instance each; switch to cluster/max if traffic warrants.
export default {
  apps: [
    {
      name: "ams-api",
      script: "dist/server/index.js",
      cwd: "./",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        API_PORT: "4000",
        API_HOST: "127.0.0.1",
      },
    },
    {
      name: "ams-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "./",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        API_URL: "http://127.0.0.1:4000/api",
      },
    },
  ],
}
