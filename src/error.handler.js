import unhandled from 'electron-unhandled';
import Log from './logger';

unhandled({
  logger: (error) => {
    Log.error(error.stack);
  },
  showDialog: !IS_PRODUCTION
});
