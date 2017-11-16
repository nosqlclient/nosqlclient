/* global Async */
import { Meteor } from 'meteor/meteor';
import { Logger, Database } from '/server/imports/modules';
import MongoDBHelper from './helper';
import MongoDBShell from './shell';

const MongoDB = () => {
  this.dbObjectsBySessionId = {};
};

MongoDB.prototype = {
  execute({ selectedCollection, methodArray, sessionId, removeCollectionTopology }) {
    Logger.info({ message: 'collection-query-execution', metadataToLog: { methodArray, selectedCollection, sessionId } });

    const execution = this.dbObjectsBySessionId[sessionId].collection(selectedCollection);
    return MongoDBHelper.proceedExecutingQuery({ methodArray, execution, sessionId, removeCollectionTopology });
  },

  executeAdmin({ methodArray, runOnAdminDB, sessionId }) {
    Logger.info({ message: 'admin-query-execution', metadataToLog: { methodArray, runOnAdminDB, sessionId } });

    const execution = runOnAdminDB ? this.dbObjectsBySessionId[sessionId].admin() : this.dbObjectsBySessionId[sessionId];
    return MongoDBHelper.proceedExecutingQuery({ methodArray, execution, sessionId });
  },

  executeMapReduce({ selectedCollection, map, reduce, options, sessionId }) {
    Logger.info({ message: 'mapreduce-execution', metadataToLog: { selectedCollection, map, reduce, options, sessionId } });

    const execution = this.dbObjectsBySessionId[sessionId].collection(selectedCollection);
    return MongoDBHelper.proceedMapReduceExecution({ execution, map, reduce, options });
  },

  disconnect({ sessionId }) {
    Logger.info({ message: 'disconnect', metadataToLog: sessionId });

    if (this.dbObjectsBySessionId[sessionId]) this.dbObjectsBySessionId[sessionId].close();

    if (MongoDBShell.spawnedShellsBySessionId[sessionId]) {
      MongoDBShell.spawnedShellsBySessionId[sessionId].stdin.end();
      MongoDBShell.spawnedShellsBySessionId[sessionId] = null;
    }

    Database.remove({ type: Database.types.ShellCommands, selector: {} });
    Database.remove({ type: Database.types.SchemaAnalyzeResult, selector: {} });
    Database.remove({ type: Database.types.Dumps, selector: {} });
  },

  dropAllCollections({ sessionId }) {
    Logger.info({ message: 'drop-all-collections', sessionId });
    return Async.runSync((done) => {
      try {
        this.dbObjectsBySessionId[sessionId].collections((err, collections) => {
          MongoDBHelper.keepDroppingCollections(collections, 0, done);
        });
      } catch (ex) {
        Logger.error({ message: 'drop-all-collections-error', ex, metadataToLog: { sessionId } });
        done(new Meteor.Error(ex.message), null);
      }
    });
  }

};

export default new MongoDB();
