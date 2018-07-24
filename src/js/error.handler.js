import unhandled from 'electron-unhandled';
import Log from './helpers/logger';

unhandled({
  logger: (error) => {
    Log.error(error.stack);
  },
  showDialog: !IS_PRODUCTION
});
