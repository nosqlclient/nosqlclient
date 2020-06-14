/* global Async */
import { Meteor } from 'meteor/meteor';
import { Logger, Database, Error } from '/server/imports/modules';

const { EJSON } = require('bson');
const os = require('os');
const fs = require('fs');

const MongoDBHelper = function () {
};

MongoDBHelper.prototype = {
  proceedExecutionStepByStep(entry, last, done, execution, metadataToLog) {
    Object.keys(entry).forEach((key) => {
      if (last && key === Object.keys(entry)[Object.keys(entry).length - 1]) {
        entry[key].push((err, docs) => {
          let errorToBeThrown = null;
          if (err) errorToBeThrown = Error.createWithoutThrow({ type: Error.types.QueryError, externalError: err, metadataToLog });
          done(errorToBeThrown, docs);
        });

        execution[key](...entry[key]);
      } else execution = execution[key](...entry[key]);
    });

    return execution;
  },

  removeConnectionTopologyFromResult(obj) {
    if (obj.result && (typeof obj.result === 'object')) {
      if ('connection' in obj.result) {
        delete obj.result.connection;
      }
    }
  },

  removeCollectionTopologyFromResult(obj) {
    if (obj.result && (typeof obj.result === 'object')) {
      obj.result = {};
    }
  },

  clearConnectionOptionsForLog(connectionOptions) {
    const result = Object.assign({}, connectionOptions);
    delete result.sslCert;
    delete result.sslCA;
    delete result.sslKey;

    return result;
  },

  keepDroppingCollections(collections, i, done) {
    if (collections.length === 0 || i >= collections.length) {
      done(null, {});
      return;
    }

    if (!collections[i].collectionName.startsWith('system')) {
      collections[i].drop().then(() => {
        this.keepDroppingCollections(collections, i += 1, done);
      });
    } else {
      this.keepDroppingCollections(collections, i += 1, done);
    }
  },

  proceedMapReduceExecution({ execution, map, reduce, options, metadataToLog }) {
    options = EJSON.deserialize(options);

    const result = Async.runSync((done) => {
      try {
        execution.mapReduce(map, reduce, options, (firstError, resultCollection) => {
          if (firstError) {
            done(Error.createWithoutThrow({ type: Error.types.QueryError, externalError: firstError, metadataToLog }), null);
            return;
          }
          if ((typeof options.out) === 'string') {
            resultCollection.find().toArray((err, finalResult) => {
              let errorToBeThrown = null;
              if (err) errorToBeThrown = Error.createWithoutThrow({ type: Error.types.QueryError, externalError: err, metadataToLog });
              done(errorToBeThrown, finalResult);
            });
          } else {
            done(null, resultCollection);
          }
        });
      } catch (exception) {
        done(Error.createWithoutThrow({ type: Error.types.QueryError, metadataToLog, externalError: exception }), null);
      }
    });

    return EJSON.serialize(result);
  },

  proceedExecutingQuery({ methodArray, execution, removeCollectionTopology, metadataToLog }) {
    const start = new Date();
    let result = Async.runSync((done) => {
      try {
        for (let i = 0; i < methodArray.length; i += 1) {
          const last = (i === (methodArray.length - 1));
          const entry = EJSON.deserialize(methodArray[i]);

          execution = this.proceedExecutionStepByStep(entry, last, done, execution, metadataToLog);
        }
      } catch (exception) {
        done(Error.createWithoutThrow({ type: Error.types.QueryError, metadataToLog, externalError: exception }), null);
      }
    });

    if (removeCollectionTopology) this.removeCollectionTopologyFromResult(result);
    this.removeConnectionTopologyFromResult(result);
    result = EJSON.serialize(result);
    result.executionTime = new Date() - start;

    return result;
  },

  getProperBinary(binaryName) {
    const settings = Database.readOne({ type: Database.types.Settings, query: {} });
    const errorMessage = `binary-${binaryName}-not-found`;
    if (settings.mongoBinaryPath) {
      const dir = `${settings.mongoBinaryPath.replace(/\\/g, '/')}/`;
      Logger.info({ message: `${binaryName}`, metadataToLog: { dir: `${dir}`, binary: `${binaryName}` } });

      switch (os.platform()) {
        case 'win32':
          if (!fs.existsSync(`${dir + binaryName}.exe`)) throw new Meteor.Error(errorMessage);
          return `${dir + binaryName}.exe`;
        default:
          if (!fs.existsSync(dir + binaryName)) throw new Meteor.Error(errorMessage);
          return dir + binaryName;
      }
    } else if (!settings.mongoBinaryPath && binaryName === 'mongo') {
      const dir = this.getMongoExternalsPath();
      switch (os.platform()) {
        case 'darwin':
          return `${dir}darwin/mongo`;
        case 'win32':
          return `${dir}win32/mongo.exe`;
        case 'linux':
          return `${dir}linux/mongo`;
        default:
          throw new Meteor.Error('not-supported-os');
      }
    } else throw new Meteor.Error(errorMessage);
  },

  getMongoExternalsPath() {
    let currentDir = process.cwd().replace(/\\/g, '/');
    currentDir = `${currentDir.substring(0, currentDir.lastIndexOf('/'))}/web.browser/app/mongo/`;

    // make sure everything has correct permissions
    fs.chmodSync(currentDir, '777');
    fs.chmodSync(`${currentDir}darwin/mongo`, '777');
    fs.chmodSync(`${currentDir}win32/mongo.exe`, '777');
    fs.chmodSync(`${currentDir}linux/mongo`, '777');
    fs.chmodSync(`${currentDir}variety/variety.js_`, '777');

    return currentDir;
  }

};

export default new MongoDBHelper();
