/**
 * Created by RSercan on 17.1.2016.
 */
Meteor.methods({
    'takeDump': function (connection, path) {
        var connectionUrl = getConnectionUrl(connection);
        var fileName = connection.databaseName + "_" + new Date().getTime() + ".tar";
        var backup = Meteor.npmRequire('mongodb-backup');

        console.log('[DUMP] Taking dump to the path: ' + path + " with fileName: " + fileName);
        return Async.runSync(function (done) {
            try {
                backup({
                    uri: connectionUrl,
                    root: path,
                    tar: fileName,
                    //stream :
                    callback: function () {
                        console.log('[DUMP] Successfuly took dump to ' + path + "/" + fileName);
                        done(null, {"result": "ok"});
                    }
                });
            }
            catch (ex) {
                done(new Meteor.Error(ex.message), null);
            }
        });
    }
});