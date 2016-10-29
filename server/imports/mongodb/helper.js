/**
 * Created by RSercan on 30.12.2015.
 */

(function () {
    import {Settings} from '/lib/imports/collections/settings';

    const objectID = require('mongodb').ObjectID;

    const addConnectionParamsToOptions = function (connection, result) {
        if (connection.useSsl || connection.sslCertificate) {
            result.server.ssl = true;
        }

        if (connection.sslCertificate) {
            result.server.sslCert = new Buffer(connection.sslCertificate);
            if (connection.passPhrase) {
                result.server.sslPass = connection.passPhrase;
            }
        }

        if (connection.rootCACertificate) {
            result.server.sslCA = new Buffer(connection.rootCACertificate);
            result.server.sslValidate = true;
        } else {
            result.server.sslValidate = false;
        }

        if (connection.certificateKey) {
            result.server.sslKey = new Buffer(connection.certificateKey);
        }
    };

    const convertDatesToString = function (obj) {
        for (let property in obj) {
            if (obj.hasOwnProperty(property) && obj[property] != null) {
                if (obj[property].constructor == Object) {
                    convertDatesToString(obj[property]);
                }
                else if (obj[property].constructor == Array) {
                    for (let i = 0; i < obj[property].length; i++) {

                        if (obj[property][i] != null && Object.prototype.toString.call(obj[property][i]) === '[object Date]') {
                            obj[property][i] = {"$date": moment(obj[property][i]).toISOString()};
                        }
                        else {
                            convertDatesToString(obj[property][i]);
                        }
                    }
                }
                else {
                    if (obj[property] != null && Object.prototype.toString.call(obj[property]) === '[object Date]') {
                        obj[property] = {"$date": moment(obj[property]).toISOString()};
                    }
                }
            }
        }
    };

    const convertObjectIDsToString = function (obj) {
        for (let property in obj) {
            if (obj.hasOwnProperty(property) && obj[property] != null) {
                if (obj[property].constructor == Object) {
                    convertObjectIDsToString(obj[property]);
                }
                else if (obj[property].constructor == Array) {
                    for (let i = 0; i < obj[property].length; i++) {
                        if (obj[property][i] != null && objectID.isValid(obj[property][i].toString()) && (obj[property][i] instanceof objectID)) {
                            obj[property][i] = {"$oid": obj[property][i].toString()};
                        }
                        else {
                            convertObjectIDsToString(obj[property][i]);
                        }
                    }
                }
                else {
                    if (obj[property] != null && objectID.isValid(obj[property].toString()) && (obj[property] instanceof objectID)) {
                        obj[property] = {"$oid": obj[property].toString()};
                    }
                }
            }
        }
    };

    const convertValidObjectIds = function (obj) {
        for (let property in obj) {
            if (obj.hasOwnProperty(property) && obj[property] != null) {
                if (obj[property].constructor == Object) {
                    if (obj[property].hasOwnProperty("$oid") && obj[property]["$oid"] != null && objectID.isValid(obj[property]["$oid"])) {
                        obj[property] = new objectID(obj[property]["$oid"].toString());
                    } else {
                        convertValidObjectIds(obj[property]);
                    }
                }
                else if (obj[property].constructor == Array) {
                    for (let i = 0; i < obj[property].length; i++) {
                        convertValidObjectIds(obj[property][i]);
                    }
                }
            }
        }
    };

    const convertValidDates = function (obj) {
        for (let property in obj) {
            if (obj.hasOwnProperty(property) && obj[property] != null) {
                if (obj[property].constructor == Object) {
                    if (obj[property].hasOwnProperty("$date") && obj[property]["$date"] != null && moment(obj[property].toString(), moment.ISO_8601).isValid()) {
                        obj[property] = moment(obj[property].toString(), moment.ISO_8601).toDate();
                    } else {
                        convertValidDates(obj[property]);
                    }
                }
                else if (obj[property].constructor == Array) {
                    for (let i = 0; i < obj[property].length; i++) {
                        if (obj[property][i] != null) {
                            convertValidDates(obj[property][i]);
                        }
                    }
                }
            }
        }
    };

    let Helper = function () {
    };
    Helper.prototype = {
        getConnectionUrl (connection) {
            if (connection.url) {
                return connection.url;
            }

            let connectionUrl = 'mongodb://';
            if (connection.user && connection.password) {
                connectionUrl += connection.user + ':' + encodeURIComponent(connection.password) + '@';
            } else if (connection.x509Username) {
                connectionUrl += encodeURIComponent(connection.x509Username) + '@'
            }


            connectionUrl += connection.host + ':' + connection.port + '/' + connection.databaseName;

            if (connection.readFromSecondary) {
                connectionUrl += '?readPreference=secondary';
            }

            if (connection.x509Username) {
                if (connectionUrl.indexOf('?') != -1) {
                    connectionUrl += '&authMechanism=MONGODB-X509';
                } else {
                    connectionUrl += '?authMechanism=MONGODB-X509';
                }
            }

            if (connection.authDatabaseName) {
                if (connectionUrl.indexOf('?') != -1) {
                    connectionUrl += '&authSource=' + connection.authDatabaseName;
                } else {
                    connectionUrl += '?authSource=' + connection.authDatabaseName;
                }
            }

            return connectionUrl;
        },

        getConnectionOptions (connection) {
            let result = {
                server: {socketOptions: {}}
            };

            addConnectionParamsToOptions(connection, result);

            const settings = Settings.findOne();
            let connectionTimeout = settings.connectionTimeoutInSeconds;
            if (connectionTimeout) {
                connectionTimeout = Math.round(connectionTimeout * 100 * 1000) / 100;
                result.server.socketOptions.connectTimeoutMS = connectionTimeout;
            }

            let socketTimeout = settings.socketTimeoutInSeconds;
            if (socketTimeout) {
                socketTimeout = Math.round(socketTimeout * 100 * 1000) / 100;
                result.server.socketOptions.socketTimeoutMS = socketTimeout;
            }

            return result;
        },

        clearConnectionOptionsForLog (connectionOptions) {
            let result = JSON.parse(JSON.stringify(connectionOptions));
            delete result.server.sslCert;
            delete result.server.sslCA;
            delete result.server.sslKey;

            return result;
        },

        removeConnectionTopology (obj) {
            if (obj.result && (typeof obj.result === 'object')) {
                if ('connection' in obj.result) {
                    delete obj.result.connection;
                }
            }
        },

        removeCollectionTopology (obj) {
            if (obj.result && (typeof obj.result === 'object')) {
                obj.result = {};
            }
        },


        convertBSONtoJSON (obj) {
            convertObjectIDsToString(obj);
            convertDatesToString(obj);
        },

        convertJSONtoBSON (obj) {
            convertValidObjectIds(obj);
            convertValidDates(obj);
        }
    };

    export default new Helper();
})();