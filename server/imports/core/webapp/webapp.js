/**
 * Created by Sercan on 26.10.2016.
 */
import { WebApp } from 'meteor/webapp';
import { Papa } from 'meteor/harrison:papa-parse';
import { Logger } from '/server/imports/modules';
import { MongoDBGridFS, MongoDB, Settings } from '../index';

WebApp.connectHandlers.use('/exportMongoclient', (req, res) => {
  Settings.exportSettings({ res });
});

WebApp.connectHandlers.use('/export', (req, res) => {
  const urlParts = decodeURI(req.url).split('&');
  const format = urlParts[0].substr(urlParts[0].indexOf('=') + 1);
  const selectedCollection = urlParts[1].substr(urlParts[1].indexOf('=') + 1);
  const selector = urlParts[2].substr(urlParts[2].indexOf('=') + 1);
  const cursorOptions = urlParts[3].substr(urlParts[3].indexOf('=') + 1);
  const sessionId = urlParts[4].substr(urlParts[4].indexOf('=') + 1);

  const methodArray = [
    {
      find: [selector],
    },
  ];
  Object.keys(cursorOptions).forEach((key) => {
    if (cursorOptions[key]) {
      const obj = {};
      obj[key] = [cursorOptions[key]];
      methodArray.push(obj);
    }
  });

  methodArray.push({ toArray: [] });

  const result = MongoDB.execute({ selectedCollection, methodArray, sessionId });
  if (result.err || result.result.error) {
    Logger.error({ message: 'export', metadataToLog: { error: result.err || result.result.error } });
    res.writeHead(400);
    res.end(`Query error: ${JSON.stringify(result.err)} ${JSON.stringify(result.result.error)}`);
  } else {
    const headers = {
      'Content-type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename=export_result.${format}`,
    };
    if (format === 'JSON') {
      res.writeHead(200, headers);
      res.end(JSON.stringify(result.result));
    } else if (format === 'CSV') {
      res.writeHead(200, headers);
      res.end(Papa.unparse(result.result, { delimiter: ';', newLine: '\n' }));
    } else {
      res.writeHead(400);
      res.end(`Unsupported format: ${format}`);
    }
  }
});


WebApp.connectHandlers.use('/healthcheck', (req, res) => {
  res.writeHead(200);
  res.end('Server is up and running !');
});

WebApp.connectHandlers.use('/download', (req, res) => {
  MongoDBGridFS.download({ req, res });
});
