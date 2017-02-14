/**
 * Created by RSercan on 30.12.2015.
 */

import {Settings} from '/lib/imports/collections/settings';
import {serialize, deserialize} from './extended_json';

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

let Helper = function () {
};
Helper.prototype = {
    getConnectionUrl (connection) {
        //TODO fix here
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
        return serialize(obj);
    },

    convertJSONtoBSON (obj) {
        return deserialize(obj);
    }
};

export default new Helper();