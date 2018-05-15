import express from 'express';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

import Log from './logger';
import { FFMPEG_PATH, PORT } from './config';

ffmpeg.setFfmpegPath(FFMPEG_PATH);

let server;

export const createServer = (app) => {
  server = express();

  server.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  server.get('/open', (req, res) => {
    let link = req.query.url;
    let newWindow = req.params.newWindow || false;

    if (link) {
      Log.info(`Opening link ${link}${(newWindow) ? ' on a new window' : ''}...`);
      res.status(200).send(app.openLink({ link, newWindow }));
    }
  });

  server.get('/video', (req, res) => {
    let filePath = req.query.filepath;
    let file = path.resolve(filePath);

    fs.stat(file, (err, stats) => {
      let range = req.headers.range;
      let positions = range.replace(/bytes=/, "").split("-");
      let start = parseInt(positions[0], 10);
      let total = stats.size;
      let end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      let chunksize = (end - start) + 1;

      res.writeHead(200, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        'Content-Type': 'video/mp4',
      });

      console.log('File info:', {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        'Content-Type': 'video/mp4',
      });
      console.log('Streaming video...', filePath);

      ffmpeg(filePath)
        .format('mp4')
        .addOptions([
          '-movflags frag_keyframe+faststart'
        ])
        .on('error', (err) => {
          Log.error(err.message);
        })
        .pipe(res, { end: true });
    });
  });

  server.listen(PORT, () => console.log(`SERVER: App listening on port ${PORT}.`));
}
