const webpack = require("webpack");
const express = require("express");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const [clientDev, serverDev] = require("../config/webpack.dev");
const appConstants = require("../config/constants");

const env = { mode: "dev", goal: "local" };

const clientDevConfig = clientDev(env);
const serverDevConfig = serverDev(env);

const serverCompiler = webpack(serverDevConfig);
const clientCompiler = webpack(clientDevConfig);

serverCompiler.watch(
  {
    ignored: /node_modules/,
  },
  (err) => {
    if (err) throw err;
  }
);

const app = express();

app.use(
  webpackDevMiddleware(clientCompiler, clientDevConfig.devServer.devMiddleware)
);
app.use(webpackHotMiddleware(clientCompiler));

app.listen(appConstants.hmrPort, () => {});
