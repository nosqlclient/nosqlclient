/**
 * Created by RSercan on 27.12.2015.
 */
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

                if (query.indexOf('find(') != -1 && query.indexOf('count(') == -1) {
                    db.eval('function(){ return ' + query + '.toArray(); }', function (err, result) {
                        done(err, result);
                        db.close();
                    });
                } else {
                    db.eval('function(){ return ' + query + '}', function (err, result) {
                        done(err, result);
                        db.close();
                    });
                }

            });
        });

        convertBSONsToString(result);
        convertDatesToString(result);

        return result;
    },

    'dropDB': function (connection) {
        var connectionUrl = getConnectionUrl(connection);
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        var result = Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, function (err, db) {
                db.dropDatabase(function (err, result) {
                    db.close();
                    done(err, result);
                });
            });
        });

        return result;
    }
});

getConnectionUrl = function (connection) {
    var connectionUrl = 'mongodb://';
    if (connection.user && connection.password) {
        connectionUrl += connection.user + ':' + connection.password + '@';
    }
    connectionUrl += connection.host + ':' + connection.port + '/' + connection.databaseName;

    return connectionUrl;
}

convertDatesToString = function (obj) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property) && obj[property] != null) {
            if (obj[property].constructor == Object) {
                convertDatesToString(obj[property]);
            }
            else if (obj[property].constructor == Array) {
                for (var i = 0; i < obj[property].length; i++) {
                    convertDatesToString(obj[property][i]);
                }
            }
            else {
                if (obj[property] instanceof Date) {
                    obj[property] = moment(obj[property]).format('DD.MM.YYYY HH:mm:ss');
                }
            }
        }
    }
}

convertBSONsToString = function (obj) {
    var objectID = Meteor.npmRequire('mongodb').ObjectID;

    for (var property in obj) {
        if (obj.hasOwnProperty(property) && obj[property] != null) {
            if (obj[property].constructor == Object) {
                convertBSONsToString(obj[property]);
            }
            else if (obj[property].constructor == Array) {
                for (var i = 0; i < obj[property].length; i++) {
                    convertBSONsToString(obj[property][i]);
                }
            }
            else {
                if (objectID.isValid(obj[property].toString())) {
                    obj[property] = obj[property].toString();
                }
            }
        }
    }
}