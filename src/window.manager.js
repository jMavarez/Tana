import electron, { dialog, BrowserWindow } from 'electron';

import { createWindow, windowExists } from './window.utils';

export function add({ type, payload }) {
  let screen = electron.screen;

  createWindow({
    x: screen.getPrimaryDisplay().size.width,
    y: 0,
    data: { type: type, payload: payload },
  });
}

export function remove(id) {
  let w = BrowserWindow.fromId(id);

  if (windowExists(w)) {
    w.destroy();
  }
}

export function showAll() {
  BrowserWindow.getAllWindows().forEach(w => {
    if (windowExists(w) && !w.isVisible()) {
      w.show();
    }
  });
}

export function hideAll() {
  BrowserWindow.getAllWindows().forEach(w => {
    if (windowExists(w) && w.isVisible()) {
      w.hide();
    }
  });
}

export function muteAll() {
  BrowserWindow.getAllWindows().forEach(w => {
    if (windowExists(w)) {
      setTimeout(() => w.webContents.send('mute', true), 500);
    }
  });
}

export function unmuteAll() {
  BrowserWindow.getAllWindows().forEach(w => {
    if (windowExists(w)) {
      setTimeout(() => w.webContents.send('mute', false), 500);
    }
  });
}
