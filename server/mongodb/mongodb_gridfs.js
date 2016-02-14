/**
 * Created by RSercan on 9.2.2016.
 */
Meteor.methods({
    'deleteFile': function (connection, bucketName, fileId) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();
        var mongodbApi = Meteor.npmRequire('mongodb');

        console.log('[GridFS Query]', 'Connection: ' + connectionUrl + ', deleting file ' + fileId + ' from bucket: ' + bucketName);
        var result = Async.runSync(function (done) {
            mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    var bucket = new mongodbApi.GridFSBucket(db, {bucketName: bucketName});
                    bucket.delete(new mongodbApi.ObjectId(fileId), function (err) {
                        done(err, null);
                        if (db) {
                            db.close();
                        }
                    });
                }
                catch (ex) {
                    console.error('Unexpected exception during fetching file informations', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });

        convertBSONtoJSON(result);
        return result;
    },

    'getFileInfos': function (connection, bucketName) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();
        var mongodbApi = Meteor.npmRequire('mongodb');

        console.log('[GridFS Query]', 'Connection: ' + connectionUrl + ', getting file informations');
        var result = Async.runSync(function (done) {
            mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    var bucket = new mongodbApi.GridFSBucket(db, {bucketName: bucketName});
                    bucket.find({}).toArray(function (err, files) {
                        done(err, files);
                        if (db) {
                            db.close();
                        }
                    });

                }
                catch (ex) {
                    console.error('Unexpected exception during fetching file informations', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });

        convertBSONtoJSON(result);
        return result;
    },

    'uploadFile': function (connection, bucketName, blob, fileName, contentType, metaData, aliases) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();
        var mongodbApi = Meteor.npmRequire('mongodb');
        if (metaData) {
            convertJSONtoBSON(metaData);
        }

        blob = new Buffer(blob);
        console.log('[GridFS Query]', 'Connection: ' + connectionUrl + ', getting file informations');
        return Async.runSync(function (done) {
            mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    var bucket = new mongodbApi.GridFSBucket(db, {bucketName: bucketName});
                    var uploadStream = bucket.openUploadStream(fileName, {
                        metadata: metaData,
                        contentType: contentType,
                        aliases: aliases
                    });
                    uploadStream.end(blob);
                    uploadStream.once('finish', function () {
                        console.log('[GridFS Query]', 'Successfuly uploaded file: ' + fileName);
                        done(null, null);
                        if (db) {
                            db.close();
                        }
                    });
                }
                catch (ex) {
                    console.error('Unexpected exception during fetching file informations', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });
    },

    'getFile': function (connection, bucketName, fileId) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();
        var mongodbApi = Meteor.npmRequire('mongodb');

        console.log('[GridFS Query]', 'Connection: ' + connectionUrl + ', getting file information: ' + fileId + ' on bucket: ' + bucketName);
        var result = Async.runSync(function (done) {
            mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    var filesCollection = db.collection(bucketName + '.files');
                    filesCollection.find({_id: new mongodbApi.ObjectId(fileId)}).limit(1).next(function (err, doc) {
                        if (doc) {
                            done(null, doc);
                        } else {
                            console.log('[GridFS Query]', 'No file found for: ' + fileId + ' on bucket: ' + bucketName);
                            done(new Meteor.Error(ex.message), null);
                        }
                        if (db) {
                            db.close();
                        }
                    });
                }
                catch (ex) {
                    console.error('Unexpected exception during fetching file informations', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });

        convertBSONtoJSON(result);
        return result;
    }
});