import { dialog } from 'electron';

import { add as windowManagerAdd } from '../helpers/window.manager';

const codeExt = ['txt', 'js'];
const imageExt = ['jpg', 'png', 'gif'];
const videoExt = ['mp4', 'mkv', 'avi', 'webm', 'ogg', 'flv', 'mov', '3gp'];

const opts = {
  title: 'Select a file.',
  filters: [
    // { name: 'All Files', extensions: [...videoExt, ...imageExt, ...codeExt] },
    // { name: 'Code', extensions: codeExt },
    // { name: 'Images', extensions: imageExt },
    { name: 'Videos', extensions: videoExt },
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
  } else if (videoExt.includes(ext)) {
    type = 'video';
  }

  return type;
}
