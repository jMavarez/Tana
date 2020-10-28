const fs = require('fs');
const path = require('path');
const series = require('run-series');
const ffbinaries = require('ffbinaries');
const log = require('./log');

const ffmpeg_version = '3.2';

function install() {
  fs.mkdirSync(path.join(__dirname, '/ffmpeg'));

  const base = path.join(__dirname, '/ffmpeg');
  const winPath = path.join(base, '/win');
  const osxPath = path.join(base, '/osx');
  const linuxPath = path.join(base, '/linux');

  const tasks = [
    (cb) => downloadFfmpeg('win', winPath, cb),
    (cb) => downloadFfmpeg('osx', osxPath, cb),
    (cb) => downloadFfmpeg('linux', linuxPath, cb)
  ];

  series(tasks, done);
}

function downloadFfmpeg(platform, dest, cb) {
  log.info(`Downloading ffmpeg binaries for ${platform}...`);
  ffbinaries.downloadBinaries(['ffmpeg'], { platform: platform, destination: dest, version: ffmpeg_version, quiet: false }, cb);
}

function done() {
  log.success('Downloaded ffmpeg binaries!');
}

install();
