/**
 * Created by RSercan on 9.2.2016.
 */
/*global Async*/
import LOGGER from "../internal/logger";
import Helper from "./helper";
import {databasesBySessionId} from "./methods_common";
import {Meteor} from "meteor/meteor";

const mongodbApi = require('mongodb');

Meteor.methods({
    deleteFiles(bucketName, selector, sessionId){
        LOGGER.info('[deleteFiles]', bucketName, selector, sessionId);

        selector = Helper.convertJSONtoBSON(selector);

        let result = Async.runSync(function (done) {
            try {
                let filesCollection = databasesBySessionId[sessionId].collection(bucketName + ".files");
                let chunksCollection = databasesBySessionId[sessionId].collection(bucketName + ".chunks");

                filesCollection.find(selector, {_id: 1}).toArray(function (err, docs) {
                    if (err) {
                        done(err, docs);
                        return;
                    }

                    let ids = [];
                    for (let obj of docs) {
                        ids.push(obj._id);
                    }

                    LOGGER.info(JSON.stringify(selector) + " removing from " + bucketName + ".files", sessionId);
                    filesCollection.deleteMany({_id: {$in: ids}}, {}, function (err) {
                        if (err) {
                            done(err, null);
                            return;
                        }

                        LOGGER.info(JSON.stringify(selector) + " removing from " + bucketName + ".chunks", sessionId);
                        chunksCollection.deleteMany({files_id: {$in: ids}}, function (err) {
                            done(err, null);
                        })
                    });
                });
            }
            catch (ex) {
                LOGGER.error('[deleteFiles]', sessionId, ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        return Helper.convertBSONtoJSON(result);
    },

    deleteFile(bucketName, fileId, sessionId) {
        LOGGER.info('[deleteFile]', bucketName, fileId, sessionId);

        let result = Async.runSync(function (done) {
            try {
                const bucket = new mongodbApi.GridFSBucket(databasesBySessionId[sessionId], {bucketName: bucketName});
                bucket.delete(new mongodbApi.ObjectId(fileId), function (err) {
                    done(err, null);
                });
            }
            catch (ex) {
                LOGGER.error('[deleteFile]', sessionId, ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        return Helper.convertBSONtoJSON(result);
    },

    getFileInfos(bucketName, selector, limit, sessionId) {
        limit = parseInt(limit) || 100;
        selector = selector || {};
        selector = Helper.convertJSONtoBSON(selector);

        LOGGER.info('[getFileInfos]', bucketName, JSON.stringify(selector), limit, sessionId);

        let result = Async.runSync(function (done) {
            try {
                const bucket = new mongodbApi.GridFSBucket(databasesBySessionId[sessionId], {bucketName: bucketName});
                bucket.find(selector, {limit: limit}).toArray(function (err, files) {
                    done(err, files);
                });

            }
            catch (ex) {
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

        blob = new Buffer(blob);

        LOGGER.info('[uploadFile]', bucketName, fileName, contentType, JSON.stringify(metaData), aliases, sessionId);

        return Async.runSync(function (done) {
            try {
                const bucket = new mongodbApi.GridFSBucket(databasesBySessionId[sessionId], {bucketName: bucketName});
                let uploadStream = bucket.openUploadStream(fileName, {
                    metadata: metaData,
                    contentType: contentType,
                    aliases: aliases
                });
                uploadStream.end(blob);
                uploadStream.once('finish', function () {
                    done(null, null);
                });
            }
            catch (ex) {
                LOGGER.error('[uploadFile]', sessionId, ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    getFile(bucketName, fileId, sessionId) {
        LOGGER.info('[getFile]', bucketName, fileId, sessionId);

        let result = Async.runSync(function (done) {
            try {
                let filesCollection = databasesBySessionId[sessionId].collection(bucketName + '.files');
                filesCollection.find({_id: new mongodbApi.ObjectId(fileId)}).limit(1).next(function (err, doc) {
                    if (doc) {
                        done(null, doc);
                    } else {
                        done(new Meteor.Error('No file found for given ID'), null);
                    }
                });
            }
            catch (ex) {
                LOGGER.error('[getFile]', sessionId, ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        return Helper.convertBSONtoJSON(result);
    }
});

