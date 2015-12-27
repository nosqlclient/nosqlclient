/**
 * Created by RSercan on 27.12.2015.
 */
Meteor.methods({
    'connect': function (connection) {
        var connectionUrl = 'mongodb://';
        if (connection.user && connection.password) {
            connectionUrl += connection.user + ':' + connection.password + '@';
        }
        connectionUrl += connection.host + ':' + connection.port + '/' + connection.databaseName;

        console.log('connecting to : ' + connectionUrl);
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        var collectionNames = Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, function (err, db) {
                db.listCollections().toArray(function (err, collections) {
                    db.close();
                    done(err, collections);
                });
            });
        });

        return collectionNames;
    }
})