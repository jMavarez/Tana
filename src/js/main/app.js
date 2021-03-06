import '../error.handler';
import './global';
import path from 'path';
import electron, {
  app,
  BrowserWindow,
  globalShortcut,
} from 'electron';
import { createServer } from './server';
import {
  init as trayInit,
  addWindowItem as trayAddWindowItem,
  addToRecentlyOpened as trayAddToRecentlyOpened,
  removeWindowItem as trayRemoveWindowItem,
} from './tray';
import { windowExists } from '../helpers/window.utils';
import {
  add as windowManagerAdd,
  remove as windowManagerRemove,
} from '../helpers/window.manager';

let refreshMousePointerId = null;
let shouldMoveSeeThrough = false;

let widevineCdmPluginPath = getWidevineCdmPluginPath();

console.log(`widevine-cdm-path: ${widevineCdmPluginPath}\n`);

app.commandLine.appendSwitch("widevine-cdm-path", widevineCdmPluginPath);
app.commandLine.appendSwitch("widevine-cdm-version", "1.4.8.970");

app.on('ready', () => {
  trayInit();

  // Init server
  app.server = createServer(app);
  app.openLink = ({ link, newWindow }) => {
    windowManagerAdd({ type: 'link', payload: link });
  }

  app.on('addWindowToTray', ({ label, id }) => {
    trayAddWindowItem({ label, id });
  });

  app.on('removeWindowFromStack', ({ id, title, type, payload }) => {
    windowManagerRemove(id);
    trayRemoveWindowItem(id);
    trayAddToRecentlyOpened({ label: title, data: { type, payload } });
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

function getWidevineCdmPluginPath() {
  let basePath = path.resolve("./node_modules/electron-widevinecdm/widevine");

  if (global.PLATFORM_DARWIN) {
    return path.join(basePath, "/darwin_x64/_platform_specific/mac_x64/widevinecdmadapter.plugin");
  } else if (global.PLATFORM_WIN32 && global.ARCH_64) {
    return path.join(basePath, "\\win32_x64\\_platform_specific\\win_x64\\widevinecdmadapter.dll");
  } else if (global.PLATFORM_WIN32 && global.ARCH_32) {
    return path.join(basePath, "\\win32_ia32\\_platform_specific\\win_x86\\widevinecdmadapter.dll");
  } else if (global.PLATFORM_LINUX) {
    return path.join(basePath, "/linux_x64/libwidevinecdmadapter.so");
  }
};
