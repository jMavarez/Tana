import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron';

import { APP_ICON, APP_VERSION } from '../config';
import { windowExists } from '../helpers/window.utils';
import { showAll, hideAll, muteAll, unmuteAll, add } from '../helpers/window.manager';
import { openFile } from './dialog';

let tray;

let windowsOnTray = [];
let recentWindows = [];
let options = [
  {
    label: "Open file",
    click: () => openFile(),
  },
  {
    label: "Recently Opened",
    submenu: [],
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
    enabled: false,
  },
  {
    type: 'separator',
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
  {
    label: 'Portal 2 test',
    visible: !IS_PRODUCTION,
    click: () => add({ type: 'link', payload: 'https://github.com/jMavarez/Tana' })
  }
];

function openSettings() {
  console.log('openSettings');
}

function openHistory() {
  console.log('openHistory');
}

export function init() {
  const trayIcon = nativeImage.createFromPath(APP_ICON);
  tray = new Tray(trayIcon);

  updateTrayMenu();
}

export function addToRecentlyOpened(item) {
  item.click = () => {
    add({ type: item.data.type, payload: item.data.payload });
  }

  recentWindows = [item, ...recentWindows];
  options[1].submenu = recentWindows;
  updateTrayMenu();
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

    windowsOnTray = [item, ...windowsOnTray];

    if (windowsOnTray.length <= 1) {
      windowsOnTray = [...windowsOnTray, { type: 'separator' }];
    }

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

function updateTrayMenu() {
  const template = [...windowsOnTray, ...options];
  const contextMenu = Menu.buildFromTemplate(template);
  tray.setContextMenu(contextMenu);
}
