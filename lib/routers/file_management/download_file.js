/**
 * Created by RSercan on 13.2.2016.
 */
Router.route('/download/:bucketName/:fileId', {
    where: 'server',
    name: 'download',
    action: function () {
        var bucketName = this.params.bucketName;
        var fileId = this.params.fileId;

        if (!bucketName || !fileId) {
            return;
        }

        var that = this;
        Meteor.call('getFile', bucketName, fileId, function (err, result) {
            if (err || result.error) {
                Template.showMeteorFuncError(err, result, "Couldn't find file");
            }
            else {
                console.log('[GridFS Query]', 'trying to download file: ' + fileId + " bucketName: " + bucketName);

                var mongodbApi = require('mongodb');
                Async.runSync(function (done) {
                    try {
                        var bucket = new mongodbApi.GridFSBucket(database, {bucketName: bucketName});
                        var headers = {
                            'Content-type': 'application/octet-stream',
                            'Content-Disposition': 'attachment; filename=' + result.result.filename
                        };
                        var downloadStream = bucket.openDownloadStream(new mongodbApi.ObjectID(fileId));
                        that.response.writeHead(200, headers);
                        var pipeStream = downloadStream.pipe(that.response);
                        pipeStream.on('finish', function () {
                            done(null, null);
                        });
                    }
                    catch (ex) {
                        console.error('Unexpected exception during downloading file', ex);
                        done(new Meteor.Error('Error while fetching file ' + ex.message));
                    }
                });
            }
        });


    }
});