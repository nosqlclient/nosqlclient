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

const packageJson = require('/package.json');
const mongodbUrlParser = require('parse-mongo-url');

const checkUsernamePassword = function (obj) {
    if (!obj.username) throw new Meteor.Error('Username is required for this authentication type !');
    if (!obj.password) throw new Meteor.Error('Password is required for this authentication type !');
};

const checkConnection = function (connection) {
    if (connection.servers.length === 0) {
        throw new Meteor.Error('At least one server is required !');
    }
    else {
        for (let server of connection.servers) {
            if (!server.host || !server.port) {
                throw new Meteor.Error('Host and port is required for each server !');
            }
        }
    }
    if (connection.authenticationType !== 'scram_sha_1') delete connection.scram_sha_1;
    if (connection.authenticationType !== 'mongodb_cr') delete connection.mongodb_cr;
    if (connection.authenticationType !== 'mongodb_x509') delete connection.mongodb_x509;
    if (connection.authenticationType !== 'gssapi') delete connection.gssapi;
    if (connection.authenticationType !== 'plain') delete connection.plain;

    if (connection.scram_sha_1) checkUsernamePassword(connection.scram_sha_1);
    if (connection.mongodb_cr) checkUsernamePassword(connection.mongodb_cr);
    if (connection.mongodb_x509) {
     //TODO
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
        if (connection.url) {
            const parsedUrl = mongodbUrlParser(connection.url);
            connection.databaseName = parsedUrl.databaseName;
            delete connection.servers;
            delete connection.authenticationType;
            delete connection.scram_sha_1;
            delete connection.mongodb_cr;
            delete connection.mongodb_x509;
            delete connection.gssapi;
            delete connection.plain;
            delete connection.ssl;
            delete connection.options;
        }

        checkConnection(connection);

        if (!connection.databaseName) {
            connection.databaseName = 'admin';
        }

        saveConnectionToDB(connection);
    },

    removeConnection(connectionId) {
        Connections.remove(connectionId);
        Dumps.remove({connectionId: connectionId});
        QueryHistory.remove({connectionId: connectionId});
    }
});