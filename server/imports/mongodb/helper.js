/**
 * Created by RSercan on 30.12.2015.
 */
import {Settings} from "/lib/imports/collections/settings";
import {deserialize, serialize} from "./extended_json";

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

const addSSLOptions = function (obj, result) {
    if (obj.rootCAFile) {
        result.sslValidate = true;
        result.sslCA = new Buffer(obj.rootCAFile);
    }
    if (obj.certificateFile) result.sslCert = new Buffer(obj.certificateFile);
    if (obj.certificateKeyFile) result.sslKey = new Buffer(obj.certificateKeyFile);
    if (obj.passPhrase) result.sslPass = obj.passPhrase;
    if (obj.disableHostnameVerification) result.checkServerIdentity = false;
};

let Helper = function () {
};

Helper.prototype = {
    getConnectionUrl (connection, addDB) {
        if (connection.url) {
            if (!addDB) {
                let options = "";
                if (connection.url.indexOf('?') !== -1) {
                    options = "?" + connection.url.split('?')[1];
                }

                const splited = connection.url.split('/');
                if (splited.length <= 3) {
                    return connection.url += "/" + options;
                }
                else {
                    splited[3] = '';
                    return splited.join('/') + options;
                }
            }

            return connection.url;
        }

        const settings = Settings.findOne();

        // url
        let connectionUrl = 'mongodb://';
        if (connection.authenticationType) {
            if (connection[connection.authenticationType].username) connectionUrl += encodeURIComponent(connection[connection.authenticationType].username);
            if (connection[connection.authenticationType].password) connectionUrl += ':' + encodeURIComponent(connection[connection.authenticationType].password);
            connectionUrl += "@";
        }
        for (let server of connection.servers) {
            connectionUrl += server.host + ':' + server.port + ',';
        }
        if (connectionUrl.endsWith(',')) connectionUrl = connectionUrl.substring(0, connectionUrl.length - 1);
        connectionUrl += "/";
        if (addDB) connectionUrl += connection.databaseName;

        // options
        if (connection.authenticationType) connectionUrl += addOptionToUrl(connectionUrl, 'authMechanism', connection.authenticationType.toUpperCase().replace(new RegExp("_", 'g'), "-"));
        if (connection.authenticationType === 'mongodb_x509') connectionUrl += addOptionToUrl(connectionUrl, 'ssl', 'true');
        else if (connection.authenticationType === 'gssapi') connectionUrl += addOptionToUrl(connectionUrl, 'gssapiServiceName', connection.gssapi.serviceName);

        if (connection.options) {
            if (connection.options.readPreference) connectionUrl += addOptionToUrl(connectionUrl, 'readPreference', connection.options.readPreference);

            if (connection.options.connectionTimeout) connectionUrl += addOptionToUrl(connectionUrl, 'connectTimeoutMS', getRoundedMilisecondsFromSeconds(connection.options.connectionTimeout));
            else connectionUrl += addOptionToUrl(connectionUrl, 'connectTimeoutMS', getRoundedMilisecondsFromSeconds(settings.connectionTimeoutInSeconds));

            if (connection.options.socketTimeout) connectionUrl += addOptionToUrl(connectionUrl, 'socketTimeoutMS', getRoundedMilisecondsFromSeconds(connection.options.socketTimeout));
            else connectionUrl += addOptionToUrl(connectionUrl, 'socketTimeoutMS', getRoundedMilisecondsFromSeconds(settings.socketTimeoutInSeconds));

            if (connection.options.replicaSetName) connectionUrl += addOptionToUrl(connectionUrl, 'replicaSet', connection.options.replicaSetName);
        }

        if (connection.ssl && connection.ssl.enabled) connectionUrl += addOptionToUrl(connectionUrl, 'ssl', 'true');

        return connectionUrl;
    },

    getConnectionOptions (connection) {
        let result = {};
        if (connection.authenticationType === 'mongodb_x509') addSSLOptions(connection.mongodb_x509, result);
        if (connection.ssl && connection.ssl.enabled) addSSLOptions(connection.ssl, result);
        if (connection.options && connection.options.connectWithNoPrimary) result.connectWithNoPrimary = true;

        // added authSource to here to provide same authSource as DB name if it's not provided when connection is being used by URL
        if (connection.authenticationType === 'mongodb_cr' || connection.authenticationType === 'scram_sha_1') {
            if (connection[connection.authenticationType].authSource) result.authSource = connection[connection.authenticationType].authSource;
            else result.authSource = connection.databaseName;
        }
        else if (connection.authenticationType === 'gssapi' || connection.authenticationType === 'plain') {
            result.authSource = '$external';
        }
        return result;
    },

    clearConnectionOptionsForLog (connectionOptions) {
        let result = JSON.parse(JSON.stringify(connectionOptions));
        delete result.sslCert;
        delete result.sslCA;
        delete result.sslKey;

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