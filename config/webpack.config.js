const { resolve, join } = require("path"); // 引入路径处理模块
const { ProvidePlugin, EnvironmentPlugin } = require("webpack"); // 引入 Webpack 内置插件
const { merge } = require("webpack-merge"); // 用于合并 Webpack 配置
const webpackNodeExternals = require("webpack-node-externals"); // 排除 Node 模块，不打进包里
const { WebpackManifestPlugin } = require("webpack-manifest-plugin"); // 生成资源清单文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 提取 CSS 到独立文件
const WebpackBar = require("webpackbar"); // 编译进度条
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin"); // 支持 TypeScript 路径别名
const ESLintPlugin = require("eslint-webpack-plugin"); // ESLint 检查插件
const LoadablePlugin = require("@loadable/webpack-plugin"); // SSR 代码分割支持插件
const { omit } = require("lodash"); // 辅助函数：从对象中剔除属性
const { name } = require("../package.json"); // 获取项目名称
const appConstants = require("./constants"); // 引入自定义常量配置

const lessModuleRegex = /\.module\.less$/; // 识别 Less Module 的正则

const handleLess = [
  "postcss-loader", // 处理 CSS 后缀、自动补全等
  "less-loader", // 将 Less 编译为 CSS
  // {
  //   loader: "style-resources-loader", // 注入全局变量（如 mixins, vars）
  //   ident: "style-resources-loader",
  //   options: {
  //   patterns: [resolve("./src/varible.less")],
  //   },
  // },
];

const common = {
  cache: { type: "filesystem" }, // 开启物理磁盘缓存，提升二次编译速度
  watchOptions: {
    ignored: /node_modules\/\.cache/, // 忽略缓存文件的监控
  },
  experiments: { topLevelAwait: true }, // 开启顶层 await 支持
  stats: "errors-warnings", // 仅输出错误和警告
  module: {
    rules: [
      // tsx/jsx 处理规则
      {
        test: /\.(t|j)sx?$/, // 匹配 ts, tsx, js, jsx 文件
        use: [
          {
            loader: "thread-loader", // 开启多线程编译加速
            options: { workers: 3 }, // 指定 worker 数量
          },
          {
            loader: "babel-loader", // 使用 Babel 转译
            options: { cacheDirectory: true }, // 开启编译缓存
          },
        ],
      },
    ],
  },
  plugins: [
    new ESLintPlugin({ // 配置 ESLint
      failOnError: true, // 报错时停止编译
      failOnWarning: false, // 警告时不停止
      threads: true, // 开启多线程
      emitWarning: false, // 不抛出警告到 Webpack
      lintDirtyModulesOnly: true, // 仅检查修改过的模块
    }),
  ],
  resolve: {
    modules: ["node_modules", resolve("src"), resolve("app")], // 查找模块的目录
    extensions: [".js", ".ts", ".tsx", ".jsx"], // 自动补全的后缀名
    plugins: [
      new TsconfigPathsPlugin({ // 路径别名插件配置
        configFile: join("./tsconfig.json"), // 配置文件路径
        extensions: [".js", ".jsx", ".ts", ".tsx"], // 支持的后缀
      }),
    ],
  },
};

const baseClientConfig = (env) => {
  const isDevelopment = /^dev/.test(env.mode); // 判断是否为开发模式

  return merge(common, { // 合并公共配置
    name: `client:${name}`, // 编译器名称
    target: "browserslist", // 目标环境（跟随 browserslist）
    entry: {
      client: [resolve("app/client/index.tsx")], // 客户端入口文件
    },
    output: {
      path: join(appConstants.buildPath, "client"), // 输出目录
      publicPath: `/static/client/`, // 资源访问的前缀路径
      clean: true, // 编译前清理输出目录
    },
    module: {
      rules: [
        // CSS 处理
        {
          test: /\.css$/, // 匹配 .css 文件
          use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"], // 提取 CSS, 解析 CSS, 后处理 CSS
          sideEffects: true, // 标记有副作用，防止被 Tree Shaking 误删
        },
        // Less 处理（非 Module）
        {
          test: /\.less$/, // 匹配 .less 文件
          exclude: lessModuleRegex, // 排除 .module.less 文件
          use: [
            MiniCssExtractPlugin.loader, // 提取为独立文件
            {
              loader: "css-loader", // 解析 CSS 映射
              options: { importLoaders: 2 }, // 在 css-loader 前有 2 个 loader（postcss 和 less）
            },
            ...handleLess, // 展开通用的 postcss 和 less 处理
          ],
          sideEffects: true, // 标记有副作用
        },
        // Less Module 处理
        {
          test: lessModuleRegex, // 匹配 .module.less 文件
          use: [
            MiniCssExtractPlugin.loader, // 提取 CSS
            {
              loader: "css-loader", // 解析 CSS
              options: {
                importLoaders: 2, // 在 css-loader 之前有 2 个 loader
                modules: {
                  localIdentName: isDevelopment // 模块化命名类名
                    ? "[path][name]__[local]" // 开发环境显示可读路径
                    : "[hash:base64]", // 生产环境显示哈希
                },
              },
            },
            ...handleLess, // 处理 Less
          ],
        },
        // 图片及字体资源处理
        {
          test: /\.(webp|png|jpg|jpeg|gif|eot|woff|woff2|ttf|otf)$/, // 匹配静态资源
          type: "asset/resource", // 作为独立资源输出并返回 URL
        },
        // SVG 处理
        {
          test: /\.svg$/i, // 匹配 .svg 文件
          issuer: /\.[jt]sx?$/, // 仅在 JS/TS 中导入时生效
          use: [
            "@svgr/webpack", // 将 SVG 转为 React 组件
            {
              loader: "file-loader", // 同时作为文件输出
              options: {
                name: "dist/media/[name].[contenthash:8].[ext]", // 输出路径及命名
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new LoadablePlugin({ // 生成 loadable-stats.json 映射文件
        outputAsset: false, // 不作为 Webpack 资源输出
        writeToDisk: true, // 直接写入磁盘
        filename: `${appConstants.buildPath}/loadable-stats.json`, // 输出路径
      }),
      new WebpackManifestPlugin(), // 生成 asset-manifest.json 资源清单:打包产物的花名册
      new WebpackBar({ name: "client", profile: true }), // 客户端编译进度条
      new EnvironmentPlugin(require(`./env/${env.goal}`)), // 写入环境变量
      //   new WebpackBuildNotifierPlugin({ // 编译完成后桌面通知（可选）
      //     title: `${name} Build`,
      //     suppressSuccess: true,
      //     logo: resolve(__dirname, "../public/favicon2.png"),
      //   }),
      new ProvidePlugin({ process: "process/browser.js" }), // 为浏览器端注入 process 全局变量
    ],
  });
};

module.exports = {
  clent: baseClientConfig, // 导出客户端配置函数
  server: (env) => // 导出服务端配置函数
    merge(common, { // 合并公共配置
      name: `server:${name}`, // 编译器名称
      externalsPresets: { node: true }, // 排除 Node.js 内置模块（如 fs, path），不打进包里
      target: "node", // 目标环境为 Node.js
      entry: omit( // 设置入口文件
        {
          server: resolve("app/server/server.ts"), // 标准服务器入口
          serverless: resolve("app/server/serverless.ts"), // Serverless 环境入口
        },
        [["online", "beta"].includes(env.goal) ? "server" : "serverless"] // 根据环境目标剔除不用的入口
      ),
      output: omit( // 设置输出
        {
          libraryTarget: "commonjs", // 输出为 CommonJS 模块
          path: resolve(appConstants.buildPath), // 输出路径
          filename: "[name].js", // 输出文件名
          chunkFilename: "scripts/[name].server.js", // 异步代码块文件名
          publicPath: "/", // 静态资源根路径
        },
        [!["online", "beta"].includes(env.goal) && "libraryTarget"].filter( // 非线上环境剔除 libraryTarget
          Boolean
        )
      ),
      module: {
        rules: [
          {
            // 在服务端忽略所有样式和静态资源，因为 Node 无法解析它们，且 SSR 不需要它们的内容
            test: /\.(less|css|svg|jpg|jpeg|png|webp|gif|eot|woff|woff2|ttf|otf)$/,
            loader: "ignore-loader", // 使用 ignore-loader 跳过这些文件
          },
        ],
      },
      plugins: [new WebpackBar({ name: "server", profile: true })], // 服务端编译进度条
    }),
};
