const { merge } = require("webpack-merge"); // 用于合并配置
const webpack = require("webpack"); // 引入 Webpack 核心
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 提取 CSS
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin"); // React 组件热更新插件
const baseConfig = require("./webpack.config.js"); // 引入通用的基础配置
const appConstants = require("./constants"); // 项目常量
const CircularDependencyPlugin = require("circular-dependency-plugin"); // 循环依赖检测

const mode = "development"; // 设置运行模式为开发模式

module.exports = [
  // --- 客户端开发配置 ---
  (env) =>
    merge(baseConfig.clent(env), {
      entry: {
        client: [
          // 注入热更新客户端代码，path 指向 HMR 服务地址
          `webpack-hot-middleware/client?path=http://localhost:${appConstants.hmrPort}/__webpack_hmr`,
        ],
      },
      output: {
        assetModuleFilename: "media/[name].[ext]", // 资源文件命名（不带哈希，方便开发调试）
        filename: "js/[name].js", // 入口 JS 命名
        chunkFilename: "js/[name].chunk.js", // 按需加载的 chunk 命名
      },
      devtool: "eval-source-map", // 生成高质量的 Source Map，加快编译并精准定位源码
      mode,
      experiments: {},
      watchOptions: {
        ignored: /node_modules\/\.cache/, // 忽略缓存文件的监控
      },
      devServer: {
        devMiddleware: {
          publicPath: appConstants.publicPath, // 静态资源公共路径
          serverSideRender: true, // 开启服务端渲染模式支持
          writeToDisk: true, // 必须写入磁盘，因为 Koa 需要读取编译后的文件
        },
        open: false, // 启动时不自动打开浏览器
        historyApiFallback: { // 处理单页应用路由 404 问题
          disableDotRule: true,
          index: `${appConstants.publicPath}/`,
        },
        hot: true, // 开启热更新
        static: {
          directory: "public", // 静态资源目录
        },
        allowedHosts: "all", // 允许所有主机访问
        compress: true, // 开启 gzip 压缩
        client: {
          logging: "error", // 控制台仅输出错误日志
          progress: true, // 显示编译进度
          overlay: false, // 报错时不覆盖全屏
          webSocketURL: `ws://localhost:${appConstants.hmrPort}/ws`, // 指定 HMR 通信的 WebSocket 地址
        },
      },
      plugins: [
        new webpack.HotModuleReplacementPlugin(), // 开启 HMR 插件
        new ReactRefreshWebpackPlugin(), // 开启 React Fast Refresh 支持
        new MiniCssExtractPlugin({ // 提取 CSS 文件的命名配置
          filename: "css/[name].css",
          chunkFilename: "css/[name].chunk.css",
        }),
        new CircularDependencyPlugin({ // 循环依赖检测配置
          exclude: /node_modules/,
          include: /src/,
          failOnError: false,
          allowAsyncCycles: false,
          cwd: process.cwd(),
        }),
      ],
    }),
  // --- 服务端开发配置 ---
  (env) =>
    merge(baseConfig.server(env), {
      mode,
      devtool: "eval-source-map", // 服务端同样生成 Source Map，方便调试 Node 代码
    }),
];
