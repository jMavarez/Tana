let package = require('../package.json');
let path = require('path');

const APP_ICON = path.join(__dirname, '..', 'static', 'tana');
const APP_NAME = "Tana";
const APP_DESCRIPTION = package.description;
const APP_VERSION = package.version;
const FFMPEG_PATH = ffmpegPath();
const INITIAL_BOUNDS = {
  width: 560,
  height: 315,
  barHeight: 28
};
const MASK_RADIUS = 200;
const PORT = 12043;
const RESOURCES_PATH = path.join(__dirname, '../../');
const STATIC_PATH = path.join(__dirname, '../static');
const MUTE_IMG = path.join(STATIC_PATH, '/mute.png');
const UNMUTE_IMG = path.join(STATIC_PATH, '/unmute.png');

function ffmpegPath() {
  if (process.platform === 'win32') {
    if (typeof IS_PACKAGED === "undefined" || !IS_PACKAGED) {
      return path.join(__dirname, '../bin/ffmpeg/ffmpeg.exe');
    } else {
      return path.join(RESOURCES_PATH, 'ffmpeg.exe');
    }
  } else if (process.platform === 'darwin') {
    if (typeof IS_PACKAGED === "undefined" || !IS_PACKAGED) {
      return path.join(__dirname, '../bin/ffmpeg/ffmpeg');
    } else {
      return path.join(RESOURCES_PATH, 'ffmpeg');
    }
  }
}

module.exports = {
  APP_ICON,
  APP_NAME,
  APP_VERSION,
  FFMPEG_PATH,
  INITIAL_BOUNDS,
  MASK_RADIUS,
  MUTE_IMG,
  PORT,
  STATIC_PATH,
  UNMUTE_IMG
}
