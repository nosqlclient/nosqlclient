/**
 * Created by RSercan on 27.12.2015.
 */
getConnectionUrl = function (connection) {
    var connectionUrl = 'mongodb://';
    if (connection.user && connection.password) {
        connectionUrl += connection.user + ':' + connection.password + '@';
    }
    connectionUrl += connection.host + ':' + connection.port + '/' + connection.databaseName;

    return connectionUrl;
}

Meteor.methods({
    'connect': function (connection) {
        var connectionUrl = getConnectionUrl(connection);
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
    },

    'executeQuery': function (connection, query) {
        var connectionUrl = getConnectionUrl(connection);
        console.log('executing query ' + query + ' on: ' + connectionUrl);
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        var result = Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, function (err, db) {
                if (query.endsWith(';')) {
                    query = query.substring(0, query.length - 1);
                }
                db.eval('function(){ return ' + query + '.toArray(); }', function (err, result) {
                    done(err, result);
                    db.close();
                });
            });
        });

        return result;
    }
})