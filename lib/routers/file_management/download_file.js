/**
 * Created by RSercan on 13.2.2016.
 */
Router.route('/download/:connectionId/:bucketName/:fileName/:fileId', {
    where: 'server',
    name: 'download',
    action: function () {
        var connection = Connections.findOne({_id: this.params.connectionId});
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions(connection);
        var mongodbApi = Meteor.npmRequire('mongodb');
        var bucketName = this.params.bucketName;
        var fileId = this.params.fileId;
        var fileName = this.params.fileName;
        if (!connection || !bucketName || !fileId || !fileName) {
            return;
        }

        console.log('[GridFS Query]', 'Connection: ' + connectionUrl + ' Options: ' + clearConnectionOptionsForLog(connectionOptions) + ', trying to download file: ' + fileId + " bucketName: " + bucketName);

        var that = this;
        Async.runSync(function (done) {
            mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    if (db) {
                        db.close();
                    }
                    console.error('Could not connect mongodb: ', mainError);
                    done(mainError, null);
                }
                try {
                    var bucket = new mongodbApi.GridFSBucket(db, {bucketName: bucketName});
                    var headers = {
                        'Content-type': 'application/octet-stream',
                        'Content-Disposition': 'attachment; filename=' + fileName
                    };
                    var downloadStream = bucket.openDownloadStream(new mongodbApi.ObjectID(fileId));
                    that.response.writeHead(200, headers);
                    var pipeStream = downloadStream.pipe(that.response);
                    pipeStream.on('finish', function () {
                        if (db) {
                            db.close();
                        }
                        done(null, null);
                    });
                }
                catch (ex) {
                    if (db) {
                        db.close();
                    }
                    console.error('Unexpected exception during downloading file', ex);
                    done(new Meteor.Error('Error while fetching file ' + ex.message));
                }
            });
        });
    }
});