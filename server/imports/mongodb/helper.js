/**
 * Created by RSercan on 30.12.2015.
 */
import {Settings} from "/lib/imports/collections/settings";
import {serialize, deserialize} from "./extended_json";

const addOptionToUrl = function (url, option, value) {
    if (!value) return url;
    if (url.substring(url.lastIndexOf('/')).indexOf('?') === -1)
        return url + '?' + option + '=' + value;
    return url + '&' + option + '=' + value;
};

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
        if (connection.url) {
            return connection.url;
        }

        let connectionUrl = 'mongodb://';
        if (connection.authenticationType === 'mongodb_cr' || connection.authenticationType === 'scram_sha_1' || connection.authenticationType === 'gssapi' || connection.authenticationType === 'plain') {
            connectionUrl += connection[connection.authenticationType].user + ':' + encodeURIComponent(connection[connection.authenticationType].password) + '@';
        }
        for (let server of connection.servers) {
            connectionUrl += server.host + ':' + server.port + ',';
        }
        if (connectionUrl.endsWith(',')) connectionUrl += connectionUrl.substring(0, connectionUrl.length - 1);
        connectionUrl += '/' + connection.databaseName;

        if (connection.authenticationType) addOptionToUrl(connectionUrl, 'authMechanism', connection.toUpperCase().replace(new RegExp("_", 'g'), "-"));
        if (connection.authenticationType === 'mongodb_cr' || connection.authenticationType === 'scram_sha_1') addOptionToUrl(connectionUrl, 'authSource', connection[connection.authenticationType].authSource);
        if (connection.authenticationType === 'mongodb_x509') {
            //TODO
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