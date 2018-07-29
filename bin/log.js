const chalk = require('chalk');
const log = console.log;

const INFO = '#59B1F7';
const WARN = '#FFC107';
const ERROR = '#F44336';
const SUCCESS = '#4CAF50';

function info(s) {
  log(chalk.hex(INFO)('[INFO] %s'), s);
}

function warn(s) {
  log(chalk.hex(WARN)('[WARN] %s'), s);
}

function error(s) {
  log(chalk.hex(ERROR)('[ERROR] %s'), s);
}

function success(s) {
  log(chalk.hex(SUCCESS)('[SUCCESS] %s'), s);
}

module.exports = {
  info,
  warn,
  error,
  success
};
