import './error.handler';
import electron, {
  app,
  BrowserWindow,
  globalShortcut,
} from 'electron';
// import widevine from 'electron-widevinecdm';

import { createServer } from './server';
import { windowExists } from './window.utils'
import * as tray from './tray';
import * as windowManager from './window.manager';
// import { MASK_RADIUS } from './config';

let refreshMousePointerId = null;
let shouldMoveSeeThrough = false;

// Test on MacOS
// if (process.platform !== 'win32') {
//   console.log('Loading widevine...');
//   widevine.load(app);
// }
// TODO: Get widevinecdm working on Windows

app.on('ready', () => {
  tray.init();

  // Init server
  app.server = createServer(app);
  app.openLink = ({ link, newWindow }) => {
    windowManager.add({ type: 'link', payload: link });
  }

  app.on('addWindowToTray', ({ label, id }) => {
    tray.addWindowItem({ label, id });
  });

  app.on('removeWindowFromStack', ({ id, title, type, payload }) => {
    windowManager.remove(id);
    tray.removeWindowItem(id);
    tray.addToRecentlyOpened({ label: title, data: { type: 'link', payload: payload } });
  });

  //Setup shortcuts
  globalShortcut.register('CmdOrCtrl+Shift+t', () => {
    shouldMoveSeeThrough = !shouldMoveSeeThrough;
    toggleMoveSeeThrough();
  });

  globalShortcut.register('CmdOrCtrl+Shift+q', () => {
    app.exit();
  });
});

app.on('before-quit', (e) => {
  e.preventDefault();
});

app.on('quit', (e) => {
  // Prevent error when interval is running on quitting
  if (shouldMoveSeeThrough) {
    clearInterval(refreshMousePointerId);
    refreshMousePointerId = null;
  }
});

const toggleMoveSeeThrough = () => {
  if (shouldMoveSeeThrough) {
    updateMousePointerPosition();
  } else {
    clearInterval(refreshMousePointerId);
    refreshMousePointerId = null;
    BrowserWindow.getAllWindows().forEach(w => {
      w.webContents.send('disableMoveSeeThrough');
    });
  }
};

const updateMousePointerPosition = () => {
  BrowserWindow.getAllWindows().forEach(w => {
    if (windowExists(w)) {
      w.setIgnoreMouseEvents(true);
    }
  });

  refreshMousePointerId = setInterval(() => {
    if (BrowserWindow.getAllWindows().length > 0) {
      BrowserWindow.getAllWindows().forEach(w => {
        // Only send the current mouse position if near a visible window and near bounds of window
        if (windowExists(w) && w.isVisible()) {
          let pointer = electron.screen.getCursorScreenPoint();

          // TODO: Improve pointer update
          // FIXME: If moving the mouse away to fast from window, mask sometimes will still show. Commenting for now...
          /* if (pointer.x >= w.getBounds().x - MASK_RADIUS && pointer.y >= w.getBounds().y - MASK_RADIUS &&
            pointer.x <= w.getBounds().x + w.getBounds().width + MASK_RADIUS && pointer.y >= w.getBounds().y - MASK_RADIUS &&
            pointer.x >= w.getBounds().x - MASK_RADIUS && pointer.y <= w.getBounds().y + w.getBounds().height + MASK_RADIUS &&
            pointer.x <= w.getBounds().x + w.getBounds().width + MASK_RADIUS && pointer.y <= w.getBounds().y + w.getBounds().height + MASK_RADIUS) { */
          w.webContents.send('pointer', { x: pointer.x - w.getBounds().x, y: pointer.y - w.getBounds().y });
        }

        /* } */
      });
    }
  }, 25);
};
