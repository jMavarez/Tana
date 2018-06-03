const webpack = require('webpack');
const path = require('path');
const { RENDERER_INPUT, MAIN_INPUT, BUILD_OUTPUT } = require('./bin/config');

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
  ],
  node: { __dirname: false },
});

const rendererConfig = (env) => Object.assign(
  baseConfig(env),
  {
    entry: { renderer: RENDERER_INPUT },
    output: { path: path.join(__dirname, BUILD_OUTPUT) },
    target: 'electron-renderer'
  }
);

const mainConfig = (env) => Object.assign(
  baseConfig(env),
  {
    entry: { main: MAIN_INPUT },
    output: { path: path.join(__dirname, BUILD_OUTPUT) },
    target: 'electron-main'
  }
);

module.exports = (env = {}) => [
  mainConfig(env),
  rendererConfig(env),
];
