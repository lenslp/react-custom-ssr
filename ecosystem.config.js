module.exports = {
  apps: [
    {
      name: "react-custom-ssr",
      script: "./build/server.js",
      watch: ["./build"], // 开启文件监听，当 build 目录下的文件发生变化时，自动重启应用
      exec_mode: "cluster", // 集群模式：让 PM2 根据你 CPU 的核心数开启多个进程实例
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
