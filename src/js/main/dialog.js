import { dialog } from 'electron';
import textExtensions from 'text-extensions';
import videoExtensions from 'video-extensions';

import { add as windowManagerAdd } from '../helpers/window.manager';

const imageExt = ['jpg', 'png', 'gif'];

const opts = {
  title: 'Select a file.',
  filters: [
    { name: 'All Files', extensions: [...textExtensions, ...videoExtensions] },
    { name: 'Text', extensions: textExtensions },
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

  if (textExtensions.includes(ext)) {
    type = 'text';
  } else if (imageExt.includes(ext)) {
    type = 'image';
  } else if (videoExtensions.includes(ext)) {
    type = 'video';
  }

  return type;
}
