/**
 * Created by RSercan on 26.12.2015.
 */
import {Meteor} from "meteor/meteor";
import {Actions} from "/lib/imports/collections/actions";
import {QueryHistory} from "/lib/imports/collections/query_history";
import {Dumps} from "/lib/imports/collections/dumps";
import {Settings} from "/lib/imports/collections/settings";
import {Connections} from "/lib/imports/collections/connections";
import SchemaAnalyzeResult from "/lib/imports/collections/schema_analyze_result";
import {HTTP} from "meteor/http";
import LOGGER from "../internal/logger";


const packageJson = require('/package.json');
const mongodbUrlParser = require('parse-mongo-url');

const checkAuthenticationOfConnection = function (connection) {
    if (connection.authenticationType !== 'scram_sha_1') delete connection.scram_sha_1;
    if (connection.authenticationType !== 'mongodb_cr') delete connection.mongodb_cr;
    if (connection.authenticationType !== 'mongodb_x509') delete connection.mongodb_x509;
    if (connection.authenticationType !== 'gssapi') delete connection.gssapi;
    if (connection.authenticationType !== 'plain') delete connection.plain;

    if (connection.mongodb_x509) delete connection.ssl;
    if (connection.gssapi && !connection.gssapi.serviceName) throw new Meteor.Error('Service name is required for GSSAPI !');
    if (connection.authenticationType && !connection[connection.authenticationType].username) throw new Meteor.Error('Username is required for this authentication type !');

};

const parseUrl = function (connection) {
    try {
        let parsedUrl = mongodbUrlParser(connection.url);
        connection.options = connection.options || {};
        connection.ssl = connection.ssl || {};
        connection.databaseName = parsedUrl.dbName || 'admin';
        connection.servers = parsedUrl.servers;
        if (parsedUrl.server_options) {
            connection.options.connectionTimeout = (parsedUrl.server_options.socketOptions && parsedUrl.server_options.socketOptions.connectTimeoutMS) ? parsedUrl.server_options.socketOptions.connectTimeoutMS : "";
            connection.options.socketTimeout = (parsedUrl.server_options.socketOptions && parsedUrl.server_options.socketOptions.socketTimeoutMS) ? parsedUrl.server_options.socketOptions.socketTimeoutMS : "";
            connection.ssl.enabled = !!parsedUrl.server_options.ssl;
        }
        connection.options.replicaSetName = (parsedUrl.rs_options && parsedUrl.rs_options.rs_name) ? parsedUrl.rs_options.rs_name : '';
        connection.options.readPreference = parsedUrl.db_options.read_preference;
        connection.authenticationType = parsedUrl.db_options.authMechanism ? parsedUrl.db_options.authMechanism.toLowerCase().replace(new RegExp("-", 'g'), "_") : '';
        if (connection.authenticationType) connection[connection.authenticationType] = {};
        if (parsedUrl.db_options.gssapiServiceName && connection.authenticationType === 'gssapi') connection.gssapi.serviceName = parsedUrl.db_options.gssapiServiceName;
        if (connection.authenticationType === 'mongodb_x509') delete connection.ssl;

        if (parsedUrl.auth) {
            // if auth exists there should be an authentication, even there's no authMechanism set
            connection.authenticationType = connection.authenticationType || 'scram_sha_1';
            connection[connection.authenticationType] = connection[connection.authenticationType] || {};
            connection[connection.authenticationType].username = parsedUrl.auth.user ? parsedUrl.auth.user : '';
            connection[connection.authenticationType].password = parsedUrl.auth.password ? parsedUrl.auth.password : '';
        }
        if (parsedUrl.db_options.authSource && (connection.authenticationType === 'mongodb_cr' || connection.authenticationType === 'scram_sha_1')) {
            connection[connection.authenticationType].authSource = parsedUrl.db_options.authSource;
        }

        return connection;
    }
    catch (ex) {
        LOGGER.error('[parseUrl]', connection.url, ex);
        throw new Meteor.Error(ex.message);
    }
};

const checkConnection = function (connection) {
    if (connection.url) {
        connection = parseUrl(connection);
    }

    if (connection.servers.length === 0) {
        throw new Meteor.Error('At least one server is required !');
    }
    else {
        for (let server of connection.servers) {
            if (!server.host || !server.port) throw new Meteor.Error('Host and port is required for each server !');
        }
    }
    checkAuthenticationOfConnection(connection);

    if (connection.ssl) {
        if (!connection.ssl.enabled) delete connection.ssl;
    }
    if (connection.ssh) {
        if (!connection.ssh.enabled) delete connection.ssh;
        if (!connection.ssh.username) throw new Meteor.Error('Username is required for SSH !');
        if (!connection.ssh.host) throw new Meteor.Error('Host is required for SSH !');
        if (!connection.ssh.port) throw new Meteor.Error('Port is required for SSH !');
        if (!connection.ssh.certificateFileName && !connection.ssh.password) throw new Meteor.Error('Either certificate or password is required for SSH !');
    }

};

const saveConnectionToDB = function (connection) {
    if (connection._id) {
        Connections.remove({_id: connection._id});
    }

    Connections.insert(connection);
};

Meteor.methods({
    checkMongoclientVersion(){
        try {
            const response = HTTP.get('https://api.github.com/repos/rsercano/mongoclient/releases/latest', {headers: {"User-Agent": "Mongoclient"}});
            if (response && response.data && response.data.name && response.data.name !== packageJson.version) {
                return "There's a new version of mongoclient: " + response.data.name + ", <a href='https://github.com/rsercano/mongoclient/releases/latest'>download here</a>";
            }
        } catch (e) {
            return null;
        }
    },

    removeSchemaAnalyzeResult(){
        SchemaAnalyzeResult.remove({});
    },

    saveActions(action) {
        Actions.insert(action);
    },

    saveQueryHistory(history) {
        const queryHistoryCount = QueryHistory.find({
            connectionId: history.connectionId,
            collectionName: history.collectionName
        }).count();

        if (queryHistoryCount >= 20) {
            QueryHistory.remove(QueryHistory.findOne({}, {sort: {date: 1}})._id);
        }

        QueryHistory.insert(history);
    },

    updateDump(dump) {
        Dumps.update({_id: dump._id}, {
            $set: {
                connectionName: dump.connectionName,
                connectionId: dump.connectionId,
                date: dump.date,
                sizeInBytes: dump.sizeInBytes,
                filePath: dump.filePath,
                status: dump.status
            }
        });
    },

    saveDump(dump) {
        Dumps.insert(dump);
    },

    updateSettings(settings) {
        Settings.update({}, {
            $set: {
                scale: settings.scale,
                maxAllowedFetchSize: settings.maxAllowedFetchSize,
                defaultResultView: settings.defaultResultView,
                autoCompleteFields: settings.autoCompleteFields,
                socketTimeoutInSeconds: settings.socketTimeoutInSeconds,
                connectionTimeoutInSeconds: settings.connectionTimeoutInSeconds,
                showDBStats: settings.showDBStats,
                showLiveChat: settings.showLiveChat,
                dbStatsScheduler: settings.dbStatsScheduler,
                dumpPath: settings.dumpPath
            }
        });
    },

    saveConnection(connection) {
        saveConnectionToDB(connection)
    },

    checkAndSaveConnection(connection){
        checkConnection(connection);

        if (!connection.databaseName) {
            connection.databaseName = 'admin';
        }

        saveConnectionToDB(connection);
    },

    parseUrl(connection){
        return parseUrl(connection);
    },

    removeConnection(connectionId) {
        Connections.remove(connectionId);
        Dumps.remove({connectionId: connectionId});
        QueryHistory.remove({connectionId: connectionId});
    }
});