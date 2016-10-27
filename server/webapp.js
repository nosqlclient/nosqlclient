/**
 * Created by Sercan on 24.10.2016.
 */
import {WebApp} from 'meteor/webapp';
import LOGGER from "/server/imports/internal/logger";
import {database} from "/server/imports/mongodb/methods_common";


const mongodbApi = require('mongodb');

WebApp.connectHandlers.use("/download", function (req, res) {
    var urlParts = req.url.split('&');
    var fileId = urlParts[0].substr(urlParts[0].indexOf('=') + 1);
    var bucketName = urlParts[1].substr(urlParts[1].indexOf('=') + 1);

    LOGGER.info('[downloadFile]', fileId, bucketName);

    if (!bucketName || !fileId) {
        LOGGER.info('[downloadFile]', 'file not found !');
        res.writeHead(400);
        res.write('File not found !');
        return;
    }

    try {
        let filesCollection = database.collection(bucketName + '.files');
        filesCollection.find({_id: new mongodbApi.ObjectId(fileId)}).limit(1).next(function (err, doc) {
            if (doc) {
                var bucket = new mongodbApi.GridFSBucket(database, {bucketName: bucketName});
                var headers = {
                    'Content-type': 'application/octet-stream',
                    'Content-Disposition': 'attachment; filename=' + doc.filename
                };
                LOGGER.info('[downloadFile]', 'file found and started downloading...');
                var downloadStream = bucket.openDownloadStream(new mongodbApi.ObjectID(fileId));
                res.writeHead(200, headers);
                var pipeStream = downloadStream.pipe(res);
                pipeStream.on('finish', function () {
                    LOGGER.info('[downloadFile]', 'file has been downloaded successfully');
                });

            } else {
                LOGGER.info('[downloadFile]', 'file not found !');
                res.writeHead(400);
                res.write('File not found !');
            }
        });
    }
    catch (ex) {
        LOGGER.error('[downloadFile]', ex);
        res.writeHead(500);
        res.write('Unexpected error: ' + ex.message);
    }
});

WebApp.connectHandlers.use("/healthcheck", function (req, res) {
    LOGGER.error('[healthcheck]');
    res.writeHead(200);
    res.write('Server is up and running !');
});