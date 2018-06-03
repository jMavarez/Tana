import { app, BrowserWindow, Menu, Tray } from 'electron';
import { execSync } from 'child_process';
import path from 'path';

import { APP_ICON, APP_VERSION } from './config';
import { windowExists } from './window.utils';
import { showAll, hideAll, muteAll, unmuteAll } from './window.manager';
import { openFile } from './dialog';

let tray;

let windowsOnTray = [];
let options = [
  {
    label: "Open file",
    click: () => openFile(),
  },
  {
    label: "Show all",
    click: () => showAll(),
  },
  {
    label: "Hide all",
    click: () => hideAll(),
  },
  {
    label: "Mute all",
    click: () => muteAll(),
  },
  {
    label: "Unmute all",
    click: () => unmuteAll(),
  },
  {
    label: "Toggle see through - Soon...",
    // click: () => toggleMoveSeeThrough(),
    enabled: false,
  },
  {
    type: 'separator',
  },
  {
    label: "History - Soon...",
    click: () => openHistory(),
    enabled: false,
  },
  {
    label: "Settings - Soon...",
    click: () => openSettings(),
    enabled: false,
  },
  {
    label: "Quit",
    accelerator: "CommandOrControl+Shift+q",
    click: () => app.exit(),
  },
  {
    type: 'separator',
  },
  {
    label: `Version ${APP_VERSION}`,
    enabled: false,
  },
];

function openSettings() {
  console.log('openSettings');
}

function openHistory() {
  console.log('openHistory');
}

export function init() {
  createTray();
}

export function addWindowItem(item = {}) {
  let shouldAdd = windowsOnTray.filter(i => i.id === item.id).length <= 0;

  if (shouldAdd) {
    item.click = () => {
      let w = BrowserWindow.fromId(item.id);

      if (windowExists(w)) {
        w.show();
      }
    };

    windowsOnTray = [item, ...windowsOnTray, { type: 'separator' }];
    updateTrayMenu();
  }
}

export function removeWindowItem(id) {
  windowsOnTray = windowsOnTray.filter(item => {
    if (item.id) {
      if (item.id !== id) return item;
    } else return item;
  });

  if (windowsOnTray.length <= 1) {
    windowsOnTray = [];
  }

  updateTrayMenu();
}

function createTray() {
  tray = new Tray(APP_ICON + '.png');
  updateTrayMenu();
}

function updateTrayMenu() {
  const template = [...windowsOnTray, ...options];
  const contextMenu = Menu.buildFromTemplate(template);
  tray.setContextMenu(contextMenu);
}
