let fs = require('fs');
let ffbinaries = require('ffbinaries');
let log = require('./log');
let path = require('path');

let dest = path.join(__dirname, '/ffmpeg');

function install() {
  downloadFfmpeg();
}

function downloadFfmpeg() {
  if (ffmpegExists()) {
    log.info('Downloading ffmpeg binaries for ' + process.platform + ' in ' + dest);
    ffbinaries.downloadBinaries(['ffmpeg'], { destination: dest }, () => {
      log.success(`Downloaded ffmpeg!`);
    });
  } else {
    log.info('Binaries already downloaded skipping...');
  }
}

function ffmpegExists() {
  switch (process.platform) {
    case 'win32':
      return !fs.existsSync(path.join(dest, 'ffmpeg.exe'));
    case 'darwin':
      return !fs.existsSync(path.join(dest, 'ffmpeg'));
  }
}

install();
