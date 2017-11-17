import { Meteor } from 'meteor/meteor';
import { MongoDBGridFS } from '/server/imports/core';

Meteor.methods({
  deleteFiles(bucketName, selector, sessionId) {
    return MongoDBGridFS.deleteFiles({ bucketName, selector, sessionId });
  },

  deleteFile(bucketName, fileId, sessionId) {
    return MongoDBGridFS.deleteFile({ bucketName, fileId, sessionId });
  },

  getFileInfos(bucketName, selector, limit, sessionId) {
    return MongoDBGridFS.getFileInfos({ bucketName, selector, limit, sessionId });
  },

  uploadFile(bucketName, blob, fileName, contentType, metaData, aliases, sessionId) {
    MongoDBGridFS.uploadFile({ bucketName, blob, fileName, contentType, metaData, aliases, sessionId });
  },

  getFile(bucketName, fileId, sessionId) {
    return MongoDBGridFS.getFile({ bucketName, fileId, sessionId });
  }
});
