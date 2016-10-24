/**
 * Created by RSercan on 9.2.2016.
 */
import LOGGER from "../internal/logger";
import Helper from "./helper";
import {database} from "./methods_common";
import {Meteor} from 'meteor/meteor';

const mongodbApi = require('mongodb');

Meteor.methods({
    deleteFile(bucketName, fileId) {
        LOGGER.info('[deleteFile]', bucketName, fileId);

        let result = Async.runSync(function (done) {
            try {
                const bucket = new mongodbApi.GridFSBucket(database, {bucketName: bucketName});
                bucket.delete(new mongodbApi.ObjectId(fileId), function (err) {
                    done(err, null);
                });
            }
            catch (ex) {
                LOGGER.error('[deleteFile]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        Helper.convertBSONtoJSON(result);
        return result;
    },

    getFileInfos(bucketName, selector, limit) {
        limit = parseInt(limit) || 100;
        selector = selector || {};
        LOGGER.info('[getFileInfos]', bucketName, selector, limit);

        let result = Async.runSync(function (done) {
            try {
                const bucket = new mongodbApi.GridFSBucket(database, {bucketName: bucketName});
                bucket.find(selector, {limit: limit}).toArray(function (err, files) {
                    done(err, files);
                });

            }
            catch (ex) {
                LOGGER.error('[getFileInfos]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        Helper.convertBSONtoJSON(result);
        return result;
    },

    uploadFile(bucketName, blob, fileName, contentType, metaData, aliases) {
        if (metaData) {
            Helper.convertJSONtoBSON(metaData);
        }

        blob = new Buffer(blob);

        LOGGER.info('[uploadFile]', bucketName, fileName, contentType, metaData, aliases);

        return Async.runSync(function (done) {
            try {
                const bucket = new mongodbApi.GridFSBucket(database, {bucketName: bucketName});
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
                LOGGER.error('[uploadFile]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    getFile(bucketName, fileId) {
        LOGGER.info('[getFile]', bucketName, fileId);

        let result = Async.runSync(function (done) {
            try {
                let filesCollection = database.collection(bucketName + '.files');
                filesCollection.find({_id: new mongodbApi.ObjectId(fileId)}).limit(1).next(function (err, doc) {
                    if (doc) {
                        done(null, doc);
                    } else {
                        done(new Meteor.Error('No file found for given ID'), null);
                    }
                });
            }
            catch (ex) {
                LOGGER.error('[getFile]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        Helper.convertBSONtoJSON(result);
        return result;
    }
});