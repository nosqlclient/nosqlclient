/**
 * Created by RSercan on 9.2.2016.
 */
Meteor.methods({
    'getFileInfos': function (connection, bucketName) {
        var connectionUrl = getConnectionUrl(connection);
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        console.log('[GridFS Query]', 'Connection: ' + connectionUrl + ', getting file informations');
        var result = Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    var bucket = new GridFSBucket(db, {bucketName: bucketName});

                }
                catch (ex) {
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });

    }
});