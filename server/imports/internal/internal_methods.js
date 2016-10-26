/**
 * Created by RSercan on 26.12.2015.
 */
import {Meteor} from 'meteor/meteor';
import {Actions} from '/lib/collections/actions';
import {QueryHistory} from '/lib/imports/collections/query_history';
import {Dumps} from '/lib/imports/collections/dumps';
import {Settings} from '/lib/imports/collections/settings';
import {Connections} from '/lib/imports/collections/connections';


Meteor.methods({
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