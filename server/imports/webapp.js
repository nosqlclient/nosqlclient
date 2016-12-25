/**
 * Created by Sercan on 26.10.2016.
 */
import {WebApp} from 'meteor/webapp';
import {Meteor} from 'meteor/meteor';
import {Papa} from 'meteor/harrison:papa-parse';
import {database} from "/server/imports/mongodb/methods_common";
import LOGGER from "/server/imports/internal/logger";

const mongodbApi = require('mongodb');

WebApp.connectHandlers.use('/export', function (req, res) {
    const urlParts = decodeURI(req.url).split('&');
    const format = urlParts[0].substr(urlParts[0].indexOf('=') + 1);
    const selectedCollection = urlParts[1].substr(urlParts[1].indexOf('=') + 1);
    const selector = urlParts[2].substr(urlParts[2].indexOf('=') + 1);
    const cursorOptions = urlParts[3].substr(urlParts[3].indexOf('=') + 1);

    LOGGER.info('[export]', format, selectedCollection, selector, cursorOptions);

    Meteor.call("find", selectedCollection, JSON.parse(selector), JSON.parse(cursorOptions), false, function (err, result) {
        if (err || result.error) {
            LOGGER.error('[export]', err, result.error);
            res.writeHead(400);
            res.end('Query error: ' + JSON.stringify(err) + " " + JSON.stringify(result.error));
        } else {
            const headers = {
                'Content-type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename=export_result.' + format
            };
            if (format === 'JSON') {
                res.writeHead(200, headers);
                res.end(JSON.stringify(result.result));
            } else if (format === 'CSV') {
                res.writeHead(200, headers);
                res.end(Papa.unparse(result.result, {delimiter: ";", newLine: "\n"}));
            } else {
                res.writeHead(400);
                res.end('Unsupported format: ' + format);
            }
        }
    });
});


WebApp.connectHandlers.use('/healthcheck', function (req, res) {
    res.writeHead(200);
    res.end('Server is up and running !');
});

WebApp.connectHandlers.use("/download", function (req, res) {
    const urlParts = decodeURI(req.url).split('&');
    let fileId = urlParts[0].substr(urlParts[0].indexOf('=') + 1);
    let bucketName = urlParts[1].substr(urlParts[1].indexOf('=') + 1);

    LOGGER.info('[downloadFile]', fileId, bucketName);

    if (!bucketName || !fileId) {
        LOGGER.info('[downloadFile]', 'file not found !');
        res.writeHead(400);
        res.end('File not found !');
        return;
    }

    try {
        let filesCollection = database.collection(bucketName + '.files');
        filesCollection.find({_id: new mongodbApi.ObjectId(fileId)}).limit(1).next(function (err, doc) {
            if (doc) {
                const bucket = new mongodbApi.GridFSBucket(database, {bucketName: bucketName});
                const headers = {
                    'Content-type': 'application/octet-stream',
                    'Content-Disposition': 'attachment; filename=' + doc.filename
                };
                LOGGER.info('[downloadFile]', 'file found and started downloading...');
                const downloadStream = bucket.openDownloadStream(new mongodbApi.ObjectID(fileId));
                res.writeHead(200, headers);
                const pipeStream = downloadStream.pipe(res);
                pipeStream.on('finish', function () {
                    LOGGER.info('[downloadFile]', 'file has been downloaded successfully');
                });

            } else {
                LOGGER.info('[downloadFile]', 'file not found !');
                res.writeHead(400);
                res.end('File not found !');
            }
        });
    }
    catch (ex) {
        LOGGER.error('[downloadFile]', ex);
        res.writeHead(500);
        res.end('Unexpected error: ' + ex.message);
    }

});