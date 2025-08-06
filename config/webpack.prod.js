const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.config.js");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackInjectPreload = require("@principalstudio/html-webpack-inject-preload");

const appConstants = require("./constants");

const mode = "production";

const createThirdpartyChunk = (chunkName, thirdPartyLibs) => ({
  [chunkName]: {
    chunks: "all",
    name: chunkName,
    test: thirdPartyLibs,
    priority: 10,
    reuseExistingChunk: true,
  },
});

const prodClient = (env) => {
  const isTest = /^test/.test(env.goal);

  return merge(baseConfig.clent(env), {
    mode,
    devtool: isTest ? "eval-source-map" : false,
    output: {
      filename: "js/[name].[contenthash:8].main.js",
      chunkFilename: "js/[name].[contenthash:8].chunk.js",
      assetModuleFilename: "media/[contenthash:8][ext]",
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: true,
        }),
        new CssMinimizerPlugin(),
      ],
      runtimeChunk: {
        name: "runtime",
      },
      splitChunks: {
        chunks: "all",
        minSize: 30000,
        minRemainingSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 10,
        maxInitialRequests: 10,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            minChunks: 1,
            priority: -10,
            reuseExistingChunk: true,
          },
 
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "public/index.ejs",
        inject: "body",
        templateParameters: {
          publicPath: appConstants.publicPath,
        },
        minify: {
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
      new MiniCssExtractPlugin({
        filename: "css/[contenthash:5].css",
        chunkFilename: "css/[contenthash:5].css",
      }),
      // new CopyPlugin({
      //   patterns: [
      //     { from: "public/audio", to: "audio" },
      //     { from: "public/charting_library", to: "charting_library" },
      //   ],
      // }),
    ],
  });
};

const prodServer = (env) => merge(baseConfig.server(env), { mode });

module.exports = [prodClient, prodServer];
