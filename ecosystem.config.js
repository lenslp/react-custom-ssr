module.exports = {
  apps: [
    {
      name: "react-custom-ssr",
      script: "./build/server.js",
      watch: ["./build"],
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3009,
      },
      output: "./logs/out.log",
      error: "./logs/error.log",
      log: "./logs/combined.outerr.log",
    },
  ],
};
