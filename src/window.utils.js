import electron, { BrowserWindow } from 'electron';
import path from 'path';
import url from 'url';

import { INITIAL_BOUNDS, MASK_RADIUS, STATIC_PATH } from './config';

export const createWindow = ({ x, y, data }) => {
  const win = new BrowserWindow({
    x: x - INITIAL_BOUNDS.width,
    y: INITIAL_BOUNDS.barHeight / 2,
    width: INITIAL_BOUNDS.width,
    height: INITIAL_BOUNDS.height + INITIAL_BOUNDS.barHeight,
    frame: false,
    transparent: true,
    fullscreenable: false,
    alwaysOnTop: true,
    hasShadow: false,
    show: false,
    webPreferences: {
      plugins: true
    }
  });

  win.loadURL(url.format({
    pathname: path.join(STATIC_PATH, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  win.once('ready-to-show', () => {
    win.show();
    if (!IS_PRODUCTION) {
      win.openDevTools({ detach: true });
    }

    setTimeout(() => {
      win.webContents.send('init', { type: data.type, payload: data.payload });
    }, 100);
  });

  win.on('browser-window-blur', (e) => {
    console.log('browser-window-blur', e);
  });

  win.on('browser-window-focus', (e) => {
    console.log('browser-window-focus', e);
  });
}

export const windowExists = (w) => !(!w || (w && w.isDestroyed()));

export const moveSeeThrough = ({ x, y }) => {
  const $body = document.body;
  const newX = $body.scrollLeft + x;
  const newY = $body.scrollTop + y;

  $body.setAttribute('style', `-webkit-mask-image: radial-gradient(
      ${MASK_RADIUS}px at ${newX}px ${newY}px,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 99%,
      rgba(0, 0, 0, 1) 100%
  );`);
};

export const disableMoveSeeThrough = () => {
  const $body = document.body;
  $body.setAttribute('style', `-webkit-mask-image: none;`);
}
