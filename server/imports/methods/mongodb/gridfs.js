import { Meteor } from 'meteor/meteor';
import { MongoDBGridFS } from '/server/imports/core';

Meteor.methods({
  deleteFiles(bucketName, selector, sessionId) {
    MongoDBGridFS.deleteFiles({ bucketName, selector, sessionId });
  },

  deleteFile(bucketName, fileId, sessionId) {
    MongoDBGridFS.deleteFile({ bucketName, fileId, sessionId });
  },

  getFileInfos(bucketName, selector, limit, sessionId) {
    MongoDBGridFS.getFileInfos({ bucketName, selector, limit, sessionId });
  },

  uploadFile(bucketName, blob, fileName, contentType, metaData, aliases, sessionId) {
    MongoDBGridFS.uploadFile({ bucketName, blob, fileName, contentType, metaData, aliases, sessionId });
  },

  getFile(bucketName, fileId, sessionId) {
    MongoDBGridFS.getFile({ bucketName, fileId, sessionId });
  }
});
