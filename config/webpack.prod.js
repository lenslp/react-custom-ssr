const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 生成 HTML 文件
const { merge } = require("webpack-merge"); // 合并配置
const baseConfig = require("./webpack.config.js"); // 基础配置
const TerserPlugin = require("terser-webpack-plugin"); // JS 压缩插件
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 提取 CSS 文件
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin"); // CSS 压缩插件
const CopyPlugin = require("copy-webpack-plugin"); // 复制文件插件
const HtmlWebpackInjectPreload = require("@principalstudio/html-webpack-inject-preload"); // 注入预加载资源

const appConstants = require("./constants");

const mode = "production"; // 生产模式

// 辅助函数：创建第三方库的独立代码块
const createThirdpartyChunk = (chunkName, thirdPartyLibs) => ({
  [chunkName]: {
    chunks: "all",
    name: chunkName,
    test: thirdPartyLibs,
    priority: 10,
    reuseExistingChunk: true,
  },
});

// --- 客户端生产配置 ---
const prodClient = (env) => {
  const isTest = /^test/.test(env.goal); // 判断是否为测试环境

  return merge(baseConfig.clent(env), {
    mode,
    devtool: isTest ? "eval-source-map" : false, // 生产环境通常不生成 Source Map 防止源码泄露
    output: {
      filename: "js/[name].[contenthash:8].main.js", // 使用 contenthash 保证内容更新时文件名才变
      chunkFilename: "js/[name].[contenthash:8].chunk.js", // chunk 也使用哈希
      assetModuleFilename: "media/[contenthash:8][ext]", // 静态资源指纹
    },
    optimization: {
      minimize: true, // 开启压缩
      minimizer: [
        new TerserPlugin({ parallel: true }), // 开启多进程并行压缩
        new CssMinimizerPlugin(), // 压缩 CSS
      ],
      runtimeChunk: { // 将 Webpack 运行时代码提取到独立文件
        name: "runtime",
      },
      splitChunks: { // 代码分割策略
        chunks: "all",
        minSize: 30000,
        minRemainingSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 10,
        maxInitialRequests: 10,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: { // 提取 node_modules 里的第三方库
            test: /[\\/]node_modules[\\/]/,
            minChunks: 1,
            priority: -10,
            reuseExistingChunk: true,
          },

          default: { // 其他公共模块提取
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
    plugins: [
      new HtmlWebpackPlugin({ // 生成用于降级兜底的静态 index.html
        filename: "index.html",
        template: "public/index.ejs",
        inject: "body",
        templateParameters: {
          publicPath: appConstants.publicPath,
        },
        minify: { // 极致压缩 HTML 内容
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
      new MiniCssExtractPlugin({ // 生产环境 CSS 文件加哈希命名
        filename: "css/[contenthash:5].css",
        chunkFilename: "css/[contenthash:5].css",
      }),
    ],
  });
};

// --- 服务端生产配置 ---
const prodServer = (env) => merge(baseConfig.server(env), { mode });

module.exports = [prodClient, prodServer]; // 导出成双端配置数组
