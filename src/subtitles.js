import fs from 'fs';
import path from 'path';
import { promisify } from 'bluebird';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export const subtitle = async (file) => {
  let root = path.dirname(file);
  let files = [];
  let items = await readdir(root);

  console.log(`Searching subtitles on ${root}...`);

  items.forEach(item => {
    let fpath = path.join(root, item);
    let fstat = await stat(fpath);

    if (!fstat.isDirectory) {
      files.push(fpath);
    }

    return files;
  });
};
