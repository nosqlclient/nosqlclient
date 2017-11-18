/* global Async */
import { Logger, Error } from '/server/imports/modules';
import { Meteor } from 'meteor/meteor';
import MongoDB from './index';
import ExtendedJSON from './extended_json';

const mongodbApi = require('mongodb');

const MongoDBGridFS = function () {
};

const tryDownloadingFile = function (sessionId, bucketName, fileId, res, metadataToLog) {
  try {
    const filesCollection = MongoDB.dbObjectsBySessionId[sessionId].collection(`${bucketName}.files`);
    filesCollection.find({ _id: new mongodbApi.ObjectId(fileId) }).limit(1).next((err, doc) => {
      if (doc) {
        const bucket = new mongodbApi.GridFSBucket(MongoDB.dbObjectsBySessionId[sessionId], { bucketName });
        const headers = {
          'Content-type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename=${encodeURIComponent(doc.filename)}`,
        };
        const downloadStream = bucket.openDownloadStream(new mongodbApi.ObjectID(fileId));
        res.writeHead(200, headers);
        downloadStream.pipe(res);
      } else {
        res.writeHead(400);
        res.end('File not found !');
      }
    });
  } catch (exception) {
    Logger.error({ message: 'download-file', metadataToLog, exception });
    res.writeHead(500);
    res.end(`Unexpected error: ${exception.message}`);
  }
};

MongoDBGridFS.prototype = {
  deleteFiles({ bucketName, selector, sessionId }) {
    const metadataToLog = { bucketName, selector, sessionId };
    Logger.info({ message: 'delete-files', metadataToLog });

    selector = ExtendedJSON.convertJSONtoBSON(selector);

    const result = Async.runSync((done) => {
      try {
        const filesCollection = MongoDB.dbObjectsBySessionId[sessionId].collection(`${bucketName}.files`);
        const chunksCollection = MongoDB.dbObjectsBySessionId[sessionId].collection(`${bucketName}.chunks`);

        filesCollection.find(selector, { _id: 1 }).toArray((firstError, docs) => {
          if (firstError) {
            done(firstError, docs);
            return;
          }

          const ids = [];
          docs.forEach(obj => ids.push(obj._id));

          Logger.info({ message: 'delete-from-files-collection', metadataToLog });
          filesCollection.deleteMany({ _id: { $in: ids } }, {}, (filesCollectionError) => {
            if (filesCollectionError) {
              done(filesCollectionError, null);
              return;
            }

            Logger.info({ message: 'delete-from-chunks-collection', metadataToLog });
            chunksCollection.deleteMany({ files_id: { $in: ids } }, (chunksCollectionError) => {
              done(chunksCollectionError, null);
            });
          });
        });
      } catch (exception) {
        done(Error.createWithoutThrow({ type: Error.types.GridFSError, formatters: ['delete-files'], metadataToLog, externalError: exception }), null);
      }
    });

    return ExtendedJSON.convertBSONtoJSON(result);
  },

  deleteFile({ bucketName, fileId, sessionId }) {
    const metadataToLog = { bucketName, fileId, sessionId };
    Logger.info({ message: 'delete-file', metadataToLog });

    const result = Async.runSync((done) => {
      try {
        const bucket = new mongodbApi.GridFSBucket(MongoDB.dbObjectsBySessionId[sessionId], { bucketName });
        bucket.delete(new mongodbApi.ObjectId(fileId), (err) => {
          done(err, null);
        });
      } catch (exception) {
        done(Error.createWithoutThrow({ type: Error.types.GridFSError, formatters: ['delete-file'], metadataToLog, externalError: exception }), null);
      }
    });

    return ExtendedJSON.convertBSONtoJSON(result);
  },

  getFilesInfo({ bucketName, selector, limit, sessionId }) {
    limit = parseInt(limit, 10) || 100;
    selector = selector || {};

    const metadataToLog = { bucketName, selector, limit, sessionId };
    selector = ExtendedJSON.convertJSONtoBSON(selector);

    Logger.info({ message: 'get-files-info', metadataToLog });

    const result = Async.runSync((done) => {
      try {
        const bucket = new mongodbApi.GridFSBucket(MongoDB.dbObjectsBySessionId[sessionId], { bucketName });
        bucket.find(selector, { limit }).toArray((err, files) => {
          done(err, files);
        });
      } catch (exception) {
        done(Error.createWithoutThrow({ type: Error.types.GridFSError, formatters: ['get-files-info'], metadataToLog, externalError: exception }), null);
      }
    });

    return ExtendedJSON.convertBSONtoJSON(result);
  },

  uploadFile({ bucketName, blob, fileName, contentType, metaData, aliases, sessionId }) {
    const metadataToLog = { bucketName, fileName, contentType, metaData, aliases, sessionId };

    if (metaData) metaData = ExtendedJSON.convertJSONtoBSON(metaData);

    blob = Buffer.from(blob);

    Logger.info({ message: 'upload-file', metadataToLog });

    return Async.runSync((done) => {
      try {
        const bucket = new mongodbApi.GridFSBucket(MongoDB.dbObjectsBySessionId[sessionId], { bucketName });
        const uploadStream = bucket.openUploadStream(fileName, {
          metadata: metaData,
          contentType,
          aliases,
        });
        uploadStream.end(blob);
        uploadStream.once('finish', () => {
          done(null, null);
        });
      } catch (exception) {
        done(Error.createWithoutThrow({ type: Error.types.GridFSError, formatters: ['upload-file'], metadataToLog, externalError: exception }), null);
      }
    });
  },

  getFile({ bucketName, fileId, sessionId }) {
    const metadataToLog = { bucketName, fileId, sessionId };
    Logger.info({ meessage: 'get-file', metadataToLog });

    const result = Async.runSync((done) => {
      try {
        const filesCollection = MongoDB.dbObjectsBySessionId[sessionId].collection(`${bucketName}.files`);
        filesCollection.find({ _id: new mongodbApi.ObjectId(fileId) }).limit(1).next((err, doc) => {
          if (doc) {
            done(null, doc);
          } else {
            done(new Meteor.Error('No file found for given ID'), null);
          }
        });
      } catch (exception) {
        done(Error.createWithoutThrow({ type: Error.types.GridFSError, formatters: ['get-file'], metadataToLog, externalError: exception }), null);
      }
    });

    return ExtendedJSON.convertBSONtoJSON(result);
  },

  download({ req, res }) {
    const urlParts = decodeURI(req.url).split('&');
    const fileId = urlParts[0].substr(urlParts[0].indexOf('=') + 1);
    const bucketName = urlParts[1].substr(urlParts[1].indexOf('=') + 1);
    const sessionId = urlParts[2].substr(urlParts[2].indexOf('=') + 1);
    const metadataToLog = { fileId, bucketName, sessionId };

    Logger.info({ message: 'download-file', metadataToLog });

    res.charset = 'UTF-8';
    if (!bucketName || !fileId) {
      res.writeHead(400);
      res.end('File not found !');
      return;
    }

    tryDownloadingFile(sessionId, bucketName, fileId, res, metadataToLog);
  }
};

export default new MongoDBGridFS();
