import fs from 'fs';
import { ipcRenderer, remote, shell } from 'electron';
import $ from 'dombo';
import Plyr from 'plyr';
import Highlightjs from 'highlightjs';
import mime from 'mime-types';

// Dombo extentions.
require('./dombo.ext')($);

import { moveSeeThrough, disableMoveSeeThrough } from '../helpers/window.utils';
import { getEmbededUrl } from '../helpers/url.utils';
import { PORT } from '../config';

import '../../styles/portal.scss';

const windowInstance = remote.getCurrentWindow();

const $title = $('.title');
const $favicon = $('.favicon > img');
const $close = $('.close');
const $hide = $('.hide');
const $muteControl = $('.mute, .unmute');
const $opacity = $('#opacity');
const $screen = $('#wrapper, #border');
const $text = $('#text');
const $video = $('#video');
const $webview = $('#webview');
const $loader = $('#loader');

let state = {};
let isMuted = false;

console.log(process.versions, navigator.plugins);

$close.on('click', () => {
  remote.app.emit('removeWindowFromStack', {
    id: windowInstance.id,
    title: document.title,
    type: state.type,
    payload: state.payload
  });
});

$hide.on('click', () => {
  windowInstance.hide();
  remote.app.emit('addWindowToTray', {
    id: windowInstance.id,
    label: document.title
  });
});

$muteControl.on('click', () => {
  shouldMute();
});

$opacity.on('input', (e) => {
  const value = e.target.value;
  $screen.forEach(($item) => {
    $item.style.opacity = value;
  });
});

ipcRenderer.once('init', (_, { type, payload }) => {
  state = { type, payload };

  switch (type) {
    case 'link':
      setupWebview();
      break;
    case 'video':
      setupVideo();
      break;
    case 'text':
      setupText();
      break;
    case 'image':
      // Set up image.
      break;
    case '3dobj':
      // Set up 3D Obj.
      break;
    default:
    // Show error not supported file or something went wrong.
  }
});

ipcRenderer.on('pointer', (_, pointer) => {
  moveSeeThrough(pointer);
});

ipcRenderer.on('disableMoveSeeThrough', (_, __) => {
  windowInstance.setIgnoreMouseEvents(false);
  disableMoveSeeThrough();
});

ipcRenderer.on('mute', (_, mute) => {
  shouldMute(mute);
});

function shouldMute(shouldMute) {
  if (shouldMute) {
    isMuted = shouldMute;
  } else {
    isMuted = !isMuted;
  }

  $muteControl.toggleClass('show');

  switch (state.type) {
    case 'link':
      $webview.el().setAudioMuted(isMuted);
      break;
    case 'video':
      $video.el().muted = isMuted;
      break;
  }
}

function hideLoader() {
  $loader.addClass('hide');
}

function setupWebview() {
  const parsedUrl = getEmbededUrl(state.payload);

  $webview.el().src = parsedUrl;
  $webview.addClass('show');

  $webview.on('dom-ready', () => {
    hideLoader();

    if (!IS_PRODUCTION) {
      $webview.el().openDevTools();
    }
  });

  $webview.on('page-title-updated', ({ title }) => {
    $title.text(title);
    document.title = title;
  });

  $webview.on('page-favicon-updated', ({ favicons }) => {
    $favicon.el().src = favicons[0];
  });

  $webview.on('new-window', ({ url }) => {
    // Figure out when to open on current window.
    // webview.loadURL(url);

    shell.openExternal(url);
  });
}

function setupVideo() {
  function setupPlyr(el) {
    let player = new Plyr(el, {
      debug: !IS_PRODUCTION,
      controls:
        ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions']
      ,
      fullscreen: {
        enabled: false
      },
      storage: {
        enabled: true,
        key: 'tana'
      }
    });
  }

  const title = getFileName(state.payload);
  $title.text(title);
  document.title = title;

  $video.el().src = state.payload;
  $video.addClass('show');

  $video.on('canplay', () => {
    setupPlyr($video.el());
    hideLoader();
  });

  $video.on('error', (e) => {
    console.error('video', e);

    switch ($video.error.code) {
      case $video.error.MEDIA_ERR_DECODE:
        console.error('video', 'MEDIA_ERR_DECODE');
        break;
      case $video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        console.error('video', 'MEDIA_ERR_SRC_NOT_SUPPORTED');
        $video.el().src = `http://127.0.0.1:${PORT}/video?filepath=${encodeURIComponent(state.payload)}`;
        break;
      case $video.error.MEDIA_ERR_ABORTED:
        console.error('video', 'MEDIA_ERR_ABORTED');
        break;
      case $video.error.MEDIA_ERR_NETWORK:
        console.error('video', 'MEDIA_ERR_NETWORK');
        break;
      default:
        console.error('video', $video.error);
    }
  });
}

function setupText() {
  const title = getFileName(state.payload);
  $title.text(title);
  document.title = title;

  const $code = $('#text > code');

  const fileType = mime.contentType(state.payload);
  const fileExtension = mime.extension(fileType);

  fs.readFile(state.payload, 'utf8', (err, data) => {
    if (err) console.error(err);

    const clazz = (fileExtension) ? `lang-${fileExtension}` : '';
    $code.addClass(clazz);
    $code.el().innerHTML = data;
    $text.addClass('show');

    hideLoader();

    Highlightjs.initHighlighting();
  });
}

function getFileName(file) {
  return file.replace(/^.*[\\\/]/, '');
}
