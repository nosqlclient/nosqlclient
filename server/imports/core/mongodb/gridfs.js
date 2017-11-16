/* global Async */
import { Logger } from '/server/imports/modules';
import { Meteor } from 'meteor/meteor';
import MongoDB from './index';
import ExtendedJSON from './extended_json';

const mongodbApi = require('mongodb');

const MongoDBGridFS = function () {
};

MongoDBGridFS.prototype = {
  deleteFiles({ bucketName, selector, sessionId }) {
    const metadataToLog = { bucketName, selector, sessionId };
    Logger.info({ message: 'deleteFiles', metadataToLog });

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

          Logger.info({ message: `${JSON.stringify(selector)} removing from ${bucketName}.files`, metadataToLog });
          filesCollection.deleteMany({ _id: { $in: ids } }, {}, (filesCollectionError) => {
            if (filesCollectionError) {
              done(filesCollectionError, null);
              return;
            }

            Logger.info({ message: `${JSON.stringify(selector)} removing from ${bucketName}.chunks`, metadataToLog });
            chunksCollection.deleteMany({ files_id: { $in: ids } }, (chunksCollectionError) => {
              done(chunksCollectionError, null);
            });
          });
        });
      } catch (exception) {
        Logger.error({ message: 'delete-files-error', exception, metadataToLog });
        done(new Meteor.Error(exception.message), null);
      }
    });

    return ExtendedJSON.convertBSONtoJSON(result);
  },

  deleteFile({ bucketName, fileId, sessionId }) {
    const metadataToLog = { bucketName, fileId, sessionId };
    Logger.info({ message: 'deleteFile', metadataToLog });

    const result = Async.runSync((done) => {
      try {
        const bucket = new mongodbApi.GridFSBucket(MongoDB.dbObjectsBySessionId[sessionId], { bucketName });
        bucket.delete(new mongodbApi.ObjectId(fileId), (err) => {
          done(err, null);
        });
      } catch (exception) {
        Logger.error({ message: 'delete-file-error', exception, metadataToLog });
        done(new Meteor.Error(exception.message), null);
      }
    });

    return ExtendedJSON.convertBSONtoJSON(result);
  },

  getFileInfos({ bucketName, selector, limit, sessionId }) {
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
        Logger.error({ message: 'get-files-info', exception, metadataToLog });
        done(new Meteor.Error(exception.message), null);
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
        Logger.error({ message: 'upload-file', exception, metadataToLog });
        done(new Meteor.Error(exception.message), null);
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
        Logger.error({ message: 'get-file', exception, metadataToLog });
        done(new Meteor.Error(exception.message), null);
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

    Logger.info({ message: 'downloadFile', metadataToLog });

    res.charset = 'UTF-8';
    if (!bucketName || !fileId) {
      Logger.info({ message: 'downloadFile', metadataTolog: 'file not found !' });
      res.writeHead(400);
      res.end('File not found !');
      return;
    }

    try {
      const filesCollection = MongoDB.dbObjectsBySessionId[sessionId].collection(`${bucketName}.files`);
      filesCollection.find({ _id: new mongodbApi.ObjectId(fileId) }).limit(1).next((err, doc) => {
        if (doc) {
          const bucket = new mongodbApi.GridFSBucket(MongoDB.dbObjectsBySessionId[sessionId], { bucketName });
          const headers = {
            'Content-type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename=${encodeURIComponent(doc.filename)}`,
          };
          Logger.info({ message: 'file found and started downloading...', metadataToLog: { headers } });
          const downloadStream = bucket.openDownloadStream(new mongodbApi.ObjectID(fileId));
          res.writeHead(200, headers);
          const pipeStream = downloadStream.pipe(res);
          pipeStream.on('finish', () => {
            Logger.info({ message: 'downloadFile', metadataToLog: 'file has been downloaded successfully' });
          });
        } else {
          Logger.info({ message: 'downloadFile', metadataTolog: 'file not found !' });
          res.writeHead(400);
          res.end('File not found !');
        }
      });
    } catch (exception) {
      Logger.error({ message: 'downloadFile', exception });
      res.writeHead(500);
      res.end(`Unexpected error: ${exception.message}`);
    }
  }
};

export default new MongoDBGridFS();
