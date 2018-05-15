import ElectronConsole from 'winston-electron';
import winston from 'winston';
import path from 'path';

const Log = new winston.Logger({
  transports: [
    new ElectronConsole({
      level: 'debug',
      handleExceptions: true
    }),
    new winston.transports.File({
      filename: path.join(directory(), 'Tana.log.txt'),
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

  if (process.platform === 'darwin') {
    prefDir = path.join(process.env.HOME, 'Library/Application Support/Tana');
  } else {
    prefDir = path.join(process.env.APPDATA, 'Tana');
  }

  return prefDir;
}

export default Log;
