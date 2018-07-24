const {
  ERROR_HANDLER,
  PORTAL_INPUT,
  PORTAL2_INPUT,
  APP_INPUT,
  BUILD_OUTPUT
} = require('./bin/config');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MyPlugin = require('./bin/webpack-my-plugin');
const path = require('path');
const Log = require('./bin/log');

const miniCssExtract = new MiniCssExtractPlugin({
  filename: `src/styles/[name].css`,
  chunkFilename: `src/styles/[id].css`
});

const envPlugins = (env) => new webpack.DefinePlugin({
  IS_PRODUCTION: env.IS_PRODUCTION ? true : false,
  IS_PACKAGED: env.IS_PACKAGED ? true : false,
  /*
    Work around for 'Unable to resolve some modules: "./lib-cov/fluent-ffmpeg"' when using webpack:
    https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/573#issuecomment-305408048
  */
  'process.env.FLUENTFFMPEG_COV': false,
});

const minifiers = (env) => {
  const p = [];

  if (env.IS_PRODUCTION) {
    p.push(new UglifyJSPlugin({
      cache: true,
      parallel: true,
      sourceMap: true
    }));

    p.push(new OptimizeCSSAssetsPlugin({}));
  }

  return p;
};

const baseConfig = (env) => ({
  context: path.resolve(__dirname, 'build'),
  stats: {
    assetsSort: 'alphabetical',
    colors: true,
  },
  resolve: {
    extensions: ['.js', '.scss', '.json'],
    modules: ['node_modules'],
    alias: {
      'fluent-ffmpeg': 'fluent-ffmpeg/lib/fluent-ffmpeg'
    }
  },
  optimization: {
    minimizer: [].concat(minifiers(env))
  },
  plugins: [
    miniCssExtract,
    envPlugins(env),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      },
      {
        test: /\.html$/,
        loaders: [
          'file-loader?name=src/views/[name].[ext]&publicPath=../../../'
        ]
      },
      {
        test: /\.(sa|sc)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(jpe?g|png|ico)$/i,
        loaders: [
          'file-loader?name=assets/[name].[ext]&publicPath=../../../'
        ]
      },
      {
        test: /\.(css)?$/,
        loaders: [
          'file-loader?name=assets/[name].[ext]'
        ]
      },
    ],
  },
  node: { __dirname: false },
});

const rendererConfig = (env) => Object.assign(
  {},
  baseConfig(env),
  {
    entry: {
      portal: PORTAL_INPUT,
      'portal-2': PORTAL2_INPUT,
      'electron.handler': ERROR_HANDLER,
    },
    output: {
      path: BUILD_OUTPUT,
      publicPath: BUILD_OUTPUT,
      chunkFilename: 'src/js/renderer/[name].js',
      filename: 'src/js/renderer/[name].js'
    },
    plugins: baseConfig(env).plugins.concat([new MyPlugin()]),
    target: 'electron-renderer'
  }
);

const mainConfig = (env) => Object.assign(
  {},
  baseConfig(env),
  {
    entry: { app: APP_INPUT },
    output: {
      path: BUILD_OUTPUT,
      publicPath: BUILD_OUTPUT,
      chunkFilename: 'src/js/main/[name].js',
      filename: 'src/js/main/[name].js'
    },
    target: 'electron-main'
  }
);

module.exports = (env = {}) => {
  Log.info(`WEBPACK ENV:\n${JSON.stringify(env, ' ', 2)}\n`);

  return [
    mainConfig(env),
    rendererConfig(env)
  ];
};
