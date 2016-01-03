/**
 * Created by RSercan on 30.12.2015.
 */
getConnectionUrl = function (connection) {
    var connectionUrl = 'mongodb://';
    if (connection.user && connection.password) {
        connectionUrl += connection.user + ':' + connection.password + '@';
    }
    connectionUrl += connection.host + ':' + connection.port + '/' + connection.databaseName;

    return connectionUrl;
};

convertBSONtoJSON = function (obj) {
    convertObjectIDsToString(obj);
    convertDatesToString(obj);
};

convertJSONtoBSON = function (obj) {
    convertValidObjectIds(obj);
    convertValidDates(obj);
};


var convertDatesToString = function (obj) {
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
                if (Object.prototype.toString.call(obj[property]) === '[object Date]') {
                    obj[property] = moment(obj[property]).format('YYYY-MM-DD HH:mm:ss.SSS');
                }
            }
        }
    }
};

var convertObjectIDsToString = function (obj) {
    var objectID = Meteor.npmRequire('mongodb').ObjectID;

    for (var property in obj) {
        if (obj.hasOwnProperty(property) && obj[property] != null) {
            if (obj[property].constructor == Object) {
                convertObjectIDsToString(obj[property]);
            }
            else if (obj[property].constructor == Array) {
                for (var i = 0; i < obj[property].length; i++) {
                    convertObjectIDsToString(obj[property][i]);
                }
            }
            else {
                if (objectID.isValid(obj[property].toString())) {
                    obj[property] = obj[property].toString();
                }
            }
        }
    }
};

var convertValidObjectIds = function (obj) {
    var objectID = Meteor.npmRequire('mongodb').ObjectID;

    for (var property in obj) {
        if (obj.hasOwnProperty(property) && obj[property] != null) {
            if (obj[property].constructor == Object) {
                convertValidObjectIds(obj[property]);
            }
            else if (obj[property].constructor == Array) {
                for (var i = 0; i < obj[property].length; i++) {
                    convertValidObjectIds(obj[property][i]);
                }
            }
            else {
                if (objectID.isValid(obj[property].toString())) {
                    obj[property] = new objectID(obj[property].toString());
                }
            }
        }
    }
};

var convertValidDates = function (obj) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property) && obj[property] != null) {
            if (obj[property].constructor == Object) {
                convertValidDates(obj[property]);
            }
            else if (obj[property].constructor == Array) {
                for (var i = 0; i < obj[property].length; i++) {
                    convertValidDates(obj[property][i]);
                }
            }
            else {
                if (moment(obj[property].toString(), 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
                    obj[property] = moment(obj[property].toString(), 'YYYY-MM-DD HH:mm:ss', true).toDate();
                }
            }
        }
    }
};