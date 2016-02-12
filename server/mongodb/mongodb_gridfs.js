/**
 * Created by RSercan on 9.2.2016.
 */
Meteor.methods({
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
    }
});