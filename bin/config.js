const path = require('path');
const pkg = require('../package.json');

module.exports = {
  APP_NAME: pkg.name,
  APP_VERSION: pkg.version,
  APP_AUTHOR: pkg.author.name,
  APP_DESCRIPTION: pkg.description,
  APP_ICON: path.join(__dirname, '../src/assets/tana'),
  ERROR_HANDLER: path.join(__dirname, '../src/js/error.handler.js'),
  PORTAL_INPUT: path.join(__dirname, '../src/js/renderer/portal.js'),
  PORTAL2_INPUT: path.join(__dirname, '../src/js/renderer/portal-2.js'),
  APP_INPUT: path.join(__dirname, '../src/js/main/app.js'),
  BUILD_OUTPUT: path.join(__dirname, '../build'),
  DIST_OUTPUT: path.join(__dirname, '../dist'),
};
