import ElectronConsole from 'winston-electron';
import winston from 'winston';
import path from 'path';
import fs from 'fs';

const Log = new winston.Logger({
  transports: [
    new ElectronConsole({
      level: 'debug',
      handleExceptions: true
    }),
    new winston.transports.File({
      filename: path.join(directory(), 'tana.log.txt'),
      json: true,
      handleExceptions: true,
      prettyPrint: true,
      level: 'debug',
      options: { flags: 'w' }
    })
  ]
});

function directory() {
  let prefDir;
  let platform = process.platform;

  if (platform === 'win32') {
    prefDir = path.join(process.env.APPDATA, 'Tana');
  } else if (platform === 'darwin'){
    prefDir = path.join(process.env.HOME, 'Library/Application Support/Tana');
  } else {
    prefDir = path.join(process.env.HOME, '/Tana');
  }

  if (!fs.existsSync(prefDir)) {
    fs.mkdirSync(prefDir);
  }

  return prefDir;
}

Log.exitOnError = (err) => {
  // Check what to do, return false for now
  return false;
};

export default Log;
