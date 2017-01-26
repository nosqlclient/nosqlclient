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
        if (Connections.findOne({name: connection.name}) != null) {
            throw new Meteor.Error('Connection name already exist: ' + connection.name);
        }

        Connections._collection.insert(connection);
    },

    updateConnection(connection) {
        Connections.remove({_id: connection._id});
        Connections._collection.insert(connection);
    },

    removeConnection(connectionId) {
        Connections.remove(connectionId);
        Dumps.remove({connectionId: connectionId});
        QueryHistory.remove({connectionId: connectionId});
    }
});