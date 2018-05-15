import { app, BrowserWindow, Menu, Tray } from 'electron';
import { execSync } from 'child_process';
import path from 'path';

import { APP_ICON, APP_VERSION } from './config';
import { windowExists } from './window.utils';
import { showAll, hideAll, muteAll, unmuteAll } from './window.manager';
import { openFile } from './dialog';

let tray;
let shouldQuit = false;

let template = [
  {
    type: 'separator'
  },
  {
    label: "Open file",
    click: () => openFile()
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
  // {
  //   label: "Toggle see through",
  //   click: () => toggleMoveSeeThrough(),
  // },
  {
    type: 'separator'
  },
  {
    label: "History",
    click: () => openHistory()
  },
  {
    label: "Settings",
    click: () => openSettings()
  },
  {
    label: "Quit",
    accelerator: "CommandOrControl+Shift+q",
    click: () => exitApp()
  },
  {
    type: 'separator'
  },
  {
    label: `Version ${APP_VERSION}`,
    enabled: false
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
  let shouldAdd = template.filter(i => i.id === item.id).length <= 0;
  if (shouldAdd) {
    item.click = () => {
      let w = BrowserWindow.fromId(item.id);

      if (windowExists(w)) {
        w.show();
      }
    };

    template = [item, ...template]
    updateTrayMenu();
  }
}

export function removeWindowItem(id) {
  template = template.filter(item => {
    if (item.id) {
      if (item.id !== id) return item;
    } else return item;
  });

  updateTrayMenu();
}

export function quit() {
  exitApp();
}

function exitApp() {
  shouldQuit = true;
  app.quit();
}

function createTray() {
  tray = new Tray(APP_ICON + '.png');
  updateTrayMenu();
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate(template)
  tray.setContextMenu(contextMenu)
}

app.on('before-quit', (e) => {
  if (!shouldQuit) {
    e.preventDefault();
  }
});
