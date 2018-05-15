let chalk = require('chalk')
let log = console.log

function info(s) {
  log(chalk.blue('[INFO] %s'), s)
}

function warn(s) {
  log(chalk.yellow('[WARN] %s'), s)
}

function error(s) {
  log(chalk.red('[ERROR] %s'), s)
}

function success(s) {
  log(chalk.green('[SUCCESS] %s'), s)
}

module.exports = {
  info, warn, error, success
}
