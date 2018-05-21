import './error.handler';
import { ipcRenderer, remote, shell } from 'electron';
import Plyr from 'plyr';

import { getEmbededUrl, isMediaLink } from './url.utils';
import { moveSeeThrough, disableMoveSeeThrough } from './window.utils';
import { PORT, MUTE_IMG, UNMUTE_IMG } from './config';

window.onresize = doLayout;

let titlebar = null, title = null, favicon = null, muteImg = null;
let state = {};
let isMuted = false;
let previousWidth = -1, previousHeight = -1;

console.log(process.versions, navigator.plugins);

onload = () => {
  const windowInstance = remote.getCurrentWindow();
  previousWidth = document.documentElement.clientWidth;
  previousHeight = document.documentElement.clientHeight;

  // Menu bar
  titlebar = document.querySelector('#titlebar');
  title = document.querySelector('#title');
  favicon = document.querySelector('#favicon');
  let close = document.querySelector('.close');
  let hide = document.querySelector('.hide');
  let mute = document.querySelector('.mute');
  muteImg = document.querySelector('#mute-img');

  close.addEventListener('mouseup', () => {
    remote.app.emit('removeWindowFromStack', { id: windowInstance.id });
  });

  hide.addEventListener('mouseup', () => {
    windowInstance.hide();
    remote.app.emit('addWindowToTray', { label: document.title, id: windowInstance.id });
  });

  mute.addEventListener('mouseup', () => {
    shouldMute(isMuted = !isMuted);
  });

  ipcRenderer.once('init', (event, { type, payload }) => {
    state = { type, payload };

    switch (type) {
      case 'link':
        setupWebView(payload);
        break;
      case 'video':
        setupVideo(payload);
        break;
      case 'image':
        // Set up image
        break;
      case '3dobj':
        // Set up 3D Obj
        break;
      default:
    }
  });

  ipcRenderer.on('pointer', (event, pointer) => {
    moveSeeThrough(pointer);
  });

  ipcRenderer.on('disableMoveSeeThrough', (event, _) => {
    windowInstance.setIgnoreMouseEvents(false);
    disableMoveSeeThrough();
  });

  ipcRenderer.on('mute', (event, mute) => {
    isMuted = mute;
    shouldMute(mute);
  });
}

function doLayout(e) {
  let borderOffset = 2;
  let widthChanged = false, heightChanged = false;
  let wrapper = document.querySelector('.wrapper');
  let controlsHeight = titlebar.offsetHeight;
  let windowWidth = document.documentElement.clientWidth;
  let windowHeight = document.documentElement.clientHeight;
  let mediaContentWidth = windowWidth - borderOffset;
  let mediaContentHeight = windowHeight - (controlsHeight + (borderOffset * 2));

  // if (windowWidth != previousWidth) {
  //   widthChanged = true;
  // }

  // if (windowHeight != previousHeight) {
  //   heightChanged = true;
  // }

  wrapper.style.width = `${mediaContentWidth}px`;
  wrapper.style.height = `${mediaContentHeight}px`;

  let video = document.querySelector('video');
  let webview = document.querySelector('webview');

  // console.log(`widthChanged: ${widthChanged} heightChanged: ${heightChanged}`);
  // console.log(`document: ${windowWidth} heightChanged: ${windowHeight}`);
  // console.log(`prev w: ${previousWidth} h: ${previousHeight}`);
  // console.log(`webview w: ${webview.offsetWidth} h: ${webview.offsetHeight}`);
  // console.log(`media w: ${mediaContentWidth} h: ${mediaContentHeight}`);

  if (state.type === 'link' && isMediaLink(state.payload)) {
    // if (widthChanged) {
    //   console.log('dragging width');
    // } else if (heightChanged) {
    //   console.log('dragging height');
    // }

    webview.style.width = `${windowWidth}px`;
    webview.style.height = `${windowWidth * (9 / 16)}px`;
  } else if (state.type === 'link') {
    webview.style.width = `${windowWidth}px`;
    webview.style.height = `${windowHeight}px`;
  }

  if (state.type === 'video') {
    video.style.width = `${windowWidth}px`;
    video.style.height = `${windowWidth * (9 / 16)}px`;
  }

  // previousWidth = windowWidth;
  // previousHeight = windowHeight;
}

function hideLoader() {
  let loader = document.querySelector('#loader');
  loader.style.display = "none";
}

function shouldMute(shouldMute) {
  muteImg.src = shouldMute ? UNMUTE_IMG : MUTE_IMG;

  switch (state.type) {
    case 'link':
      let webview = document.querySelector('webview');
      webview.setAudioMuted(shouldMute);
      break;
    case 'video':
      let video = document.querySelector('video');
      video.muted = shouldMute;
      break;
    default:
  }
}

function setupWebView(link) {
  let wrapper = document.querySelector('.wrapper');
  let webview = document.createElement('webview');
  let parsedUrl = getEmbededUrl(link);

  webview.src = parsedUrl;

  if (parsedUrl.includes('youtube')) {
    webview.setAttribute('httpreferrer', 'https://www.youtube.com/');
  }

  webview.setAttribute('partition', 'persist:tana');
  webview.setAttribute('plugins', '');

  webview.addEventListener('dom-ready', () => {
    webview.insertCSS(`
      ::-webkit-scrollbar { display: none; }
      body { background-color: black; -webkit-user-select: none; }
    `);

    if (!IS_PRODUCTION) {
      webview.openDevTools();
    }
  });

  webview.addEventListener('did-start-loading', () => {
  });

  webview.addEventListener('did-stop-loading', () => {
    hideLoader();
  });

  webview.addEventListener('page-title-updated', (page) => {
    title.textContent = page.title;
    document.title = page.title;
  });

  webview.addEventListener('page-favicon-updated', ({ favicons }) => {
    favicon.src = favicons[0];
  });

  webview.addEventListener('new-window', ({ url }) => {
    // Figure out when to open on current window
    // webview.loadURL(url);
    shell.openExternal(url);
  });

  webview.addEventListener('error', (e) => {
    console.log('error', e);
  });

  wrapper.append(webview);

  doLayout();
}

function setupVideo(file) {
  let filename = file.replace(/^.*[\\\/]/, '');
  title.textContent = filename;
  document.title = filename;

  let wrapper = document.querySelector('.wrapper');
  let video = document.createElement('video');

  video.setAttribute('src', file);

  video.addEventListener('canplay', () => {
    setupPlyr(video);
    hideLoader();
  });

  video.addEventListener('error', (e) => {
    console.error('video', e);
    switch (video.error.code) {
      case video.error.MEDIA_ERR_DECODE:
        console.error('video', 'MEDIA_ERR_DECODE');
        break;
      case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        console.error('video', 'MEDIA_ERR_SRC_NOT_SUPPORTED');
        video.setAttribute('src', `http://127.0.0.1:${PORT}/video?filepath=${encodeURIComponent(file)}`);
        break;
      case video.error.MEDIA_ERR_ABORTED:
        console.error('video', 'MEDIA_ERR_ABORTED');
        break;
      case video.error.MEDIA_ERR_NETWORK:
        console.error('video', 'MEDIA_ERR_NETWORK');
        break;
      default:
        console.error('video', video.error);
    }
  });

  wrapper.append(video);

  doLayout();
}

function setupPlyr(element) {
  let player = new Plyr(element, {
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
