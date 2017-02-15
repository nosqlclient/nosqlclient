/**
 * Created by RSercan on 30.12.2015.
 */
import {Settings} from "/lib/imports/collections/settings";
import {serialize, deserialize} from "./extended_json";

const addOptionToUrl = function (url, option, value) {
    if (!value) return '';
    if (url.substring(url.lastIndexOf('/')).indexOf('?') === -1)
        return '?' + option + '=' + value;
    return '&' + option + '=' + value;
};

const getRoundedMilisecondsFromSeconds = function (sec) {
    if (sec) return Math.round(sec * 100 * 1000) / 100;
    return '30000';
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

        const settings = Settings.findOne();

        let connectionUrl = 'mongodb://';
        if (connection.authenticationType === 'mongodb_cr' || connection.authenticationType === 'scram_sha_1' || connection.authenticationType === 'gssapi' || connection.authenticationType === 'plain') {
            connectionUrl += connection[connection.authenticationType].username + ':' + encodeURIComponent(connection[connection.authenticationType].password) + '@';
        }
        else if (connection.authenticationType === 'mongodb_x509' && connection.mongodb_x509.username) {
            connectionUrl += encodeURIComponent(connection.mongodb_x509.username) + '@';
        }
        for (let server of connection.servers) {
            connectionUrl += server.host + ':' + server.port + ',';
        }
        if (connectionUrl.endsWith(',')) connectionUrl = connectionUrl.substring(0, connectionUrl.length - 1);
        connectionUrl += '/' + connection.databaseName;

        if (connection.authenticationType) connectionUrl += addOptionToUrl(connectionUrl, 'authMechanism', connection.authenticationType.toUpperCase().replace(new RegExp("_", 'g'), "-"));
        if (connection.authenticationType === 'mongodb_cr' || connection.authenticationType === 'scram_sha_1') connectionUrl += addOptionToUrl(connectionUrl, 'authSource', connection[connection.authenticationType].authSource);
        else if (connection.authenticationType === 'mongodb_x509') connectionUrl += addOptionToUrl(connectionUrl, 'ssl', 'true');
        else if (connection.authenticationType === 'gssapi' || connection.authenticationType === 'plain') {
            if (connection.authenticationType === 'gssapi') connectionUrl += addOptionToUrl(connectionUrl, 'gssapiServiceName', connection.gssapi.serviceName);
            connectionUrl += addOptionToUrl(connectionUrl, 'authSource', '$external');
        }

        if (connection.options.readPreference) connectionUrl += addOptionToUrl(connectionUrl, 'readPreference', connection.options.readPreference);
        if (connection.options.connectionTimeout) connectionUrl += addOptionToUrl(connectionUrl, 'connectTimeoutMS', connection.options.connectionTimeout);
        else connectionUrl += addOptionToUrl(connectionUrl, 'connectTimeoutMS', getRoundedMilisecondsFromSeconds(settings.connectionTimeoutInSeconds));
        if (connection.options.socketTimeout) connectionUrl += addOptionToUrl(connectionUrl, 'socketTimeoutMS', connection.options.socketTimeout);
        else connectionUrl += addOptionToUrl(connectionUrl, 'socketTimeoutMS', getRoundedMilisecondsFromSeconds(settings.socketTimeoutInSeconds));
        if (connection.options.replicaSetName) connectionUrl += addOptionToUrl(connectionUrl, 'replicaSet', connection.options.replicaSetName);

        return connectionUrl;
    },

    getConnectionOptions (connection) {
        let result = {
            server: {socketOptions: {}}
        };
        //TODO
        addConnectionParamsToOptions(connection, result);


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