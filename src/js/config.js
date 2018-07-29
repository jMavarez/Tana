const pkg = require('../../package.json');
const path = require('path');
const WIN_ICON = require('../assets/tana.ico');
const DARWIN_LINUX_ICON = require('../assets/tana.png');

const APP_AUTHOR = pkg.author.name;
const APP_ICON = getIcon();
const APP_NAME = "Tana";
const APP_DESCRIPTION = pkg.description;
const APP_VERSION = pkg.version;
const FFMPEG_PATH = ffmpegPath();
const INITIAL_BOUNDS = {
  width: 560,
  height: 315,
  barHeight: 26
};
const MASK_RADIUS = 200;
const PORT = 12043;
const TANA_ICON = DARWIN_LINUX_ICON;

function ffmpegPath() {
  if (process.platform === 'win32') {
    return require('../../bin/ffmpeg/win/ffmpeg.exe');
  } else if (process.platform === 'darwin') {
    return require('../../bin/ffmpeg/osx/ffmpeg');
  }
}

function getIcon() {
  if (process.platform === 'win32') {
    return path.join(__dirname, WIN_ICON);
  } else {
    return path.join(__dirname, DARWIN_LINUX_ICON);
  }
}

module.exports = {
  APP_AUTHOR,
  APP_DESCRIPTION,
  APP_ICON,
  APP_NAME,
  APP_VERSION,
  FFMPEG_PATH,
  INITIAL_BOUNDS,
  MASK_RADIUS,
  PORT,
  TANA_ICON
};
