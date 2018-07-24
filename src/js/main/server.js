import express from 'express';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

import Log from '../helpers/logger';
import { FFMPEG_PATH, PORT } from '../config';

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
    const filePath = req.query.filepath;
    const range = req.headers.range;
    const file = path.resolve(filePath);
    const fileStat = fs.statSync(file);
    const fileSize = fileStat.size;

    // Calculate chunks
    if (range) {
      const positions = range.replace(/bytes=/, "").split("-");
      const start = parseInt(positions[0], 10);
      const end = positions[1] ? parseInt(positions[1], 10) : fileSize - 1;
      const chuckSize = (end - start) + 1;

      let headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chuckSize,
        'Content-Type': 'video/mp4',
        'Connection': 'keep-alive'
      };

      res.writeHead(206, headers);
    } else {
      let headers = {
        "Content-Length": fileSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(200, headers);
    }

    console.log('Streaming video...', filePath);

    ffmpeg(filePath)
      .format('mp4')
      .outputOption('-movflags frag_keyframe+faststart')
      .on('error', (err) => {
        Log.error(err.message);
      })
      .pipe(res, { end: true });
  });

  server.listen(PORT, () => console.log(`SERVER: App listening on port ${PORT}.`));

  process.on('uncaughtException', (err) => {
    switch (err.errno) {
      case 'EACCES':
        Log.error('Port ' + PORT + ' requires elevated privileges!');
        app.exit();
        break;
      case 'EADDRINUSE':
        Log.error('Port ' + PORT + ' is already in use!');
        app.exit();
        break;
      default:
        throw err;
    }
  });
}
