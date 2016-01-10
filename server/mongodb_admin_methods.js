/**
 * Created by RSercan on 10.1.2016.
 */
Meteor.methods({
    'addUser': function (connection, username, password, options) {
        var methodArray = [
            {
                "addUser": [username, password, options]
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    }
});


var proceedQueryExecution = function (connection, methodArray) {
    var connectionUrl = getConnectionUrl(connection);
    var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

    console.log('[Admin Query]', 'Connection: ' + connectionUrl + ', MethodArray: ' + JSON.stringify(methodArray));

    var result = Async.runSync(function (done) {
        mongodbApi.connect(connectionUrl, function (mainError, db) {
            if (mainError) {
                done(mainError, null);
                if (db) {
                    db.close();
                }
                return;
            }
            try {
                var execution = db.admin();
                for (var i = 0; i < methodArray.length; i++) {
                    var last = i == (methodArray.length - 1);
                    var entry = methodArray[i];
                    convertJSONtoBSON(entry);

                    for (var key in entry) {
                        if (last && key == Object.keys(entry)[Object.keys(entry).length - 1]) {
                            entry[key].push(function (err, docs) {
                                done(err, docs);
                                if (db) {
                                    db.close();
                                }
                            });
                            execution[key].apply(execution, entry[key]);
                        }
                        else {
                            execution = execution[key].apply(execution, entry[key]);
                        }
                    }
                }
            }
            catch (ex) {
                done(new Meteor.Error(ex.message), null);
                if (db) {
                    db.close();
                }
            }
        });
    });

    convertBSONtoJSON(result);
    return result;
};