const { RENDERER_INPUT, MAIN_INPUT, BUILD_OUTPUT } = require('./bin/config');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const Log = require('./bin/log');

const plugins = (env) => {
  const p = [];

  if (env.IS_PRODUCTION) {
    p.push(new UglifyJSPlugin({
      parallel: true,
      sourceMap: true
    }));
  }

  return p;
};

const baseConfig = (env) => ({
  plugins: [
    new webpack.DefinePlugin({
      IS_PRODUCTION: env.IS_PRODUCTION ? true : false,
      IS_PACKAGED: env.IS_PACKAGED ? true : false,
    }),
    /*
      Work around for 'Unable to resolve some modules: "./lib-cov/fluent-ffmpeg"' when using webpack:
      https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/573#issuecomment-305408048
     */
    new webpack.DefinePlugin({
      'process.env.FLUENTFFMPEG_COV': false
    })
  ].concat(plugins(env)),
  node: { __dirname: false },
});

const rendererConfig = (env) => Object.assign(
  {},
  baseConfig(env),
  {
    entry: { renderer: RENDERER_INPUT },
    output: { path: path.join(__dirname, BUILD_OUTPUT) },
    target: 'electron-renderer'
  }
);

const mainConfig = (env) => Object.assign(
  {},
  baseConfig(env),
  {
    entry: { main: MAIN_INPUT },
    output: { path: path.join(__dirname, BUILD_OUTPUT) },
    target: 'electron-main'
  }
);

module.exports = (env = {}) => {
  Log.info(`WEBPACK ENV: \n${JSON.stringify(env, ' ', 2)}\n`);
  return [
    mainConfig(env),
    rendererConfig(env),
  ];
};
