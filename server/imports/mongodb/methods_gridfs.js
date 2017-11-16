/**
 * Created by RSercan on 9.2.2016.
 */
/* global Async */
import { Meteor } from 'meteor/meteor';
import LOGGER from '../modules/logger/logger';
import Helper from './helper';
import { databasesBySessionId } from './methods_common';

const mongodbApi = require('mongodb');

Meteor.methods({
  deleteFiles(bucketName, selector, sessionId) {
    LOGGER.info('[deleteFiles]', bucketName, selector, sessionId);

    selector = Helper.convertJSONtoBSON(selector);

    const result = Async.runSync((done) => {
      try {
        const filesCollection = dbObjectsBySessionId[sessionId].collection(`${bucketName}.files`);
        const chunksCollection = dbObjectsBySessionId[sessionId].collection(`${bucketName}.chunks`);

        filesCollection.find(selector, { _id: 1 }).toArray((firstError, docs) => {
          if (firstError) {
            done(firstError, docs);
            return;
          }

          const ids = [];
          docs.forEach(obj => ids.push(obj._id));

          LOGGER.info(`${JSON.stringify(selector)} removing from ${bucketName}.files`, sessionId);
          filesCollection.deleteMany({ _id: { $in: ids } }, {}, (filesCollectionError) => {
            if (filesCollectionError) {
              done(filesCollectionError, null);
              return;
            }

            LOGGER.info(`${JSON.stringify(selector)} removing from ${bucketName}.chunks`, sessionId);
            chunksCollection.deleteMany({ files_id: { $in: ids } }, (chunksCollectionError) => {
              done(chunksCollectionError, null);
            });
          });
        });
      } catch (ex) {
        LOGGER.error('[deleteFiles]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });

    return Helper.convertBSONtoJSON(result);
  },

  deleteFile(bucketName, fileId, sessionId) {
    LOGGER.info('[deleteFile]', bucketName, fileId, sessionId);

    const result = Async.runSync((done) => {
      try {
        const bucket = new mongodbApi.GridFSBucket(dbObjectsBySessionId[sessionId], { bucketName });
        bucket.delete(new mongodbApi.ObjectId(fileId), (err) => {
          done(err, null);
        });
      } catch (ex) {
        LOGGER.error('[deleteFile]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });

    return Helper.convertBSONtoJSON(result);
  },

  getFileInfos(bucketName, selector, limit, sessionId) {
    limit = parseInt(limit, 10) || 100;
    selector = selector || {};
    selector = Helper.convertJSONtoBSON(selector);

    LOGGER.info('[getFileInfos]', bucketName, JSON.stringify(selector), limit, sessionId);

    const result = Async.runSync((done) => {
      try {
        const bucket = new mongodbApi.GridFSBucket(dbObjectsBySessionId[sessionId], { bucketName });
        bucket.find(selector, { limit }).toArray((err, files) => {
          done(err, files);
        });
      } catch (ex) {
        LOGGER.error('[getFileInfos]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });

    return Helper.convertBSONtoJSON(result);
  },

  uploadFile(bucketName, blob, fileName, contentType, metaData, aliases, sessionId) {
    if (metaData) {
      metaData = Helper.convertJSONtoBSON(metaData);
    }

    blob = Buffer.from(blob);

    LOGGER.info('[uploadFile]', bucketName, fileName, contentType, JSON.stringify(metaData), aliases, sessionId);

    return Async.runSync((done) => {
      try {
        const bucket = new mongodbApi.GridFSBucket(dbObjectsBySessionId[sessionId], { bucketName });
        const uploadStream = bucket.openUploadStream(fileName, {
          metadata: metaData,
          contentType,
          aliases,
        });
        uploadStream.end(blob);
        uploadStream.once('finish', () => {
          done(null, null);
        });
      } catch (ex) {
        LOGGER.error('[uploadFile]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });
  },

  getFile(bucketName, fileId, sessionId) {
    LOGGER.info('[getFile]', bucketName, fileId, sessionId);

    const result = Async.runSync((done) => {
      try {
        const filesCollection = dbObjectsBySessionId[sessionId].collection(`${bucketName}.files`);
        filesCollection.find({ _id: new mongodbApi.ObjectId(fileId) }).limit(1).next((err, doc) => {
          if (doc) {
            done(null, doc);
          } else {
            done(new Meteor.Error('No file found for given ID'), null);
          }
        });
      } catch (ex) {
        LOGGER.error('[getFile]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });

    return Helper.convertBSONtoJSON(result);
  },
});

