/* global Async */
import { Meteor } from 'meteor/meteor';
import { Logger, Database } from '/server/imports/modules';
import ExtendedJSON from './extended_json';

const os = require('os');
const fs = require('fs');

const MongoDBHelper = () => {
};

MongoDBHelper.prototype = {
  proceedExecutionStepByStep(entry, last, done, execution) {
    Object.keys(entry).forEach((key) => {
      if (last && key === Object.keys(entry)[Object.keys(entry).length - 1]) {
        entry[key].push((err, docs) => {
          done(err, docs);
        });

        execution[key](...entry[key]);
      } else {
        execution = execution[key](...entry[key]);
      }
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

  proceedMapReduceExecution({ execution, map, reduce, options }) {
    options = ExtendedJSON.convertJSONtoBSON(options);

    const result = Async.runSync((done) => {
      try {
        execution.mapReduce(map, reduce, options, (firstError, resultCollection) => {
          if (firstError) {
            done(firstError, null);
            return;
          }
          if ((typeof options.out) === 'string') {
            resultCollection.find().toArray((err, finalResult) => {
              done(err, finalResult);
            });
          } else {
            done(firstError, resultCollection);
          }
        });
      } catch (ex) {
        Logger.error({ message: 'mapreduce-execution-error', ex, metadataToLog: { map, reduce, options } });
        done(new Meteor.Error(ex.message), null);
      }
    });

    return ExtendedJSON.convertBSONtoJSON(result);
  },

  proceedExecutingQuery({ methodArray, execution, sessionId, removeCollectionTopology }) {
    const result = Async.runSync((done) => {
      try {
        for (let i = 0; i < methodArray.length; i += 1) {
          const last = (i === (methodArray.length - 1));
          const entry = ExtendedJSON.convertJSONtoBSON(methodArray[i]);

          execution = this.proceedExecutionStepByStep(entry, last, done, execution);
        }
      } catch (ex) {
        Logger.error({ message: 'query-execution-error', ex, metadataToLog: { methodArray, sessionId } });
        done(new Meteor.Error(ex.message));
      }
    });

    if (removeCollectionTopology) this.removeCollectionTopologyFromResult(result);
    this.removeConnectionTopologyFromResult(result);
    return ExtendedJSON.convertBSONtoJSON(result);
  },

  getProperBinary(binaryName) {
    const settings = Database.readOne({ type: Database.types.Settings });
    if (settings.mongoBinaryPath) {
      const dir = `${settings.mongoBinaryPath.replace(/\\/g, '/')}/`;
      Logger.info({ message: `${binaryName}`, metadataToLog: `checking dir ${dir} for binary ${binaryName}` });
      const errorMessage = `Binary ${binaryName} not found in ${dir + binaryName}, please set mongo binary path from settings`;

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
          throw new Meteor.Error(`Not supported os: ${os.platform()}, you can set mongo binary path from settings`);
      }
    } else throw new Meteor.Error('Please set mongo binaries from settings');
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
