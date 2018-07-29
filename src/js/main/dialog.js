import { dialog } from 'electron';
import videoExtensions from 'video-extensions';

import { add as windowManagerAdd } from '../helpers/window.manager';

const codeExt = ['txt', 'js'];
const imageExt = ['jpg', 'png', 'gif'];

const opts = {
  title: 'Select a file.',
  filters: [
    { name: 'All Files', extensions: [...videoExtensions] },
    // { name: 'Code', extensions: codeExt },
    // { name: 'Images', extensions: imageExt },
    { name: 'Videos', extensions: videoExtensions },
  ],
  properties: ['openFile']
};

export function openFile() {
  dialog.showOpenDialog(opts, (path) => {
    if (!Array.isArray(path)) return;
    windowManagerAdd({ type: getTypeByExtention(path[0]), payload: path[0] });
  });
}

function getTypeByExtention(path) {
  let type = 'none';
  let ext = path.slice((path.lastIndexOf(".") + 1));

  if (codeExt.includes(ext)) {
    type = 'code';
  } else if (imageExt.includes(ext)) {
    type = 'image';
  } else if (videoExtensions.includes(ext)) {
    type = 'video';
  }

  return type;
}
