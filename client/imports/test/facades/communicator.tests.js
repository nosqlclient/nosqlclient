/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { Meteor } from 'meteor/meteor';
import { Communicator } from '/client/imports/facades';

/**
 * Every method is important regardless of the call method, so writing at least one test for each method.
 */
describe('Communicator', () => {
  describe('call tests', () => {
    const assertExecution = function (methodName) {
      expect(Meteor.call.callCount).to.equal(1);
      expect(Meteor.call.getCall(0).args[0]).to.equal(methodName);
      expect(Meteor.call.calledWithMatch(sinon.match.string, sinon.match.object, sinon.match.func)).to.equal(true);
    };

    beforeEach(() => {
      sinon.stub(Meteor, 'call');
    });

    afterEach(() => {
      Meteor.call.restore();
    });

    it('count', () => {
      // prepare
      const methodName = 'count';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'sercan', selector: { name: 'tugce' } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        selectedCollection: 'sercan',
        selector: { name: 'tugce' },
        options: {},
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('find', () => {
      // prepare
      const methodName = 'find';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'sercan', selector: { name: 'tugce' }, cursorOptions: { limit: 15 } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        selectedCollection: 'sercan',
        selector: { name: 'tugce' },
        cursorOptions: { limit: 15 },
        executeExplain: false,
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('dropAllCollections', () => {
      // prepare
      const methodName = 'dropAllCollections';

      // execute
      Communicator.call({ methodName, args: { extraInvalidParam: 'invalid' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('delete', () => {
      // prepare
      const methodName = 'delete';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'sercan', selector: { surname: 'ozdemir' }, extra: true }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'sercan',
        selector: { surname: 'ozdemir' }
      });
    });

    it('dropCollection', () => {
      // prepare
      const methodName = 'dropCollection';

      // execute
      Communicator.call({ methodName, args: { }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: ''
      });
    });

    it('connect', () => {
      // prepare
      const methodName = 'connect';

      // execute
      Communicator.call({ methodName, args: { connectionId: '123', username: 'tttt', password: '1' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        connectionId: '123',
        username: 'tttt',
        password: '1'
      });
    });

    it('dropDB', () => {
      // prepare
      const methodName = 'dropDB';

      // execute
      Communicator.call({ methodName, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('aggregate', () => {
      // prepare
      const methodName = 'aggregate';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'ttt' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'ttt',
        pipeline: [],
        options: {}
      });
    });

    it('listCollectionNames', () => {
      // prepare
      const methodName = 'listCollectionNames';

      // execute
      Communicator.call({ methodName, args: { dbName: '123' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        dbName: '123'
      });
    });

    it('createCollection', () => {
      // prepare
      const methodName = 'createCollection';

      // execute
      Communicator.call({ methodName, args: { collectionName: 'sercan', options: { test: 123 } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        collectionName: 'sercan',
        options: { test: 123 }
      });
    });

    it('command', () => {
      // prepare
      const methodName = 'command';

      // execute
      Communicator.call({ methodName, args: { command: { blabla: true }, runOnAdminDB: true, options: { xxx: 123 } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        runOnAdminDB: true,
        command: { blabla: true },
        options: { xxx: 123 }
      });
    });

    it('command (1)', () => {
      // prepare
      const methodName = 'command';

      // execute
      Communicator.call({ methodName, args: { command: 'testing', runOnAdminDB: true, options: { xxx: 123 } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        runOnAdminDB: true,
        command: { },
        options: { xxx: 123 }
      });
    });

    it('rename', () => {
      // prepare
      const methodName = 'rename';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'xas', newName: 'ttt' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'xas',
        newName: 'ttt',
        options: {}
      });
    });

    it('stats', () => {
      // prepare
      const methodName = 'stats';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'testt', options: {} }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'testt',
        options: {}
      });
    });

    it('importMongoclient', () => {
      // prepare
      const methodName = 'importMongoclient';

      // execute
      Communicator.call({ methodName, args: { file: { ufuk: [{ mal: true }] } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        file: { ufuk: [{ mal: true }] }
      });
    });

    it('listDatabases', () => {
      // prepare
      const methodName = 'listDatabases';

      // execute
      Communicator.call({ methodName, args: { extra: '123' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('saveConnection', () => {
      // prepare
      const methodName = 'saveConnection';

      // execute
      Communicator.call({ methodName, args: { connection: '123' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        connection: {}
      });
    });

    it('disconnect', () => {
      // prepare
      const methodName = 'disconnect';

      // execute
      Communicator.call({ methodName, args: { connection: '123' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('parseUrl', () => {
      // prepare
      const methodName = 'parseUrl';

      // execute
      Communicator.call({ methodName, args: { connection: { test: [1], test2: 'sercan', test3: false, test4: { name: 'tugce' } } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        connection: { test: [1], test2: 'sercan', test3: false, test4: { name: 'tugce' } }
      });
    });

    it('removeConnection', () => {
      // prepare
      const methodName = 'removeConnection';

      // execute
      Communicator.call({ methodName, args: { connection: { test: [1], test2: 'sercan', test3: false, test4: { name: 'tugce' } }, connectionId: '123' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        connectionId: '123'
      });
    });

    it('checkAndSaveConnection', () => {
      // prepare
      const methodName = 'checkAndSaveConnection';

      // execute
      Communicator.call({ methodName, args: { connection: { test: [1], test2: 'sercan', test3: false, test4: { name: 'tugce' } }, connectionId: '123' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        connection: { test: [1], test2: 'sercan', test3: false, test4: { name: 'tugce' } }
      });
    });

    it('saveQueryHistory', () => {
      // prepare
      const methodName = 'saveQueryHistory';

      // execute
      Communicator.call({ methodName, args: { history: { asd: 123 } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        history: { asd: 123 }
      });
    });

    it('saveFindResult', () => {
      // prepare
      const methodName = 'saveFindResult';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'xxx', updateObjects: [{ myObject: 123 }], deletedObjectIds: [], addedObjects: [{ test: true }] }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'xxx',
        updateObjects: [{ myObject: 123 }],
        deletedObjectIds: [],
        addedObjects: [{ test: true }]
      });
    });

    it('updateOne', () => {
      // prepare
      const methodName = 'updateOne';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'test', selector: { name: 'sercan', abc: false }, setObject: { surname: 'ozdemir' } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'test',
        selector: { name: 'sercan', abc: false },
        setObject: { surname: 'ozdemir' },
        options: {}
      });
    });

    it('checkMongoclientVersion', () => {
      // prepare
      const methodName = 'checkMongoclientVersion';

      // execute
      Communicator.call({ methodName, args: { test: 123 }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('removeDumpLogs', () => {
      // prepare
      const methodName = 'removeDumpLogs';

      // execute
      Communicator.call({ methodName, args: { test: 123, binary: 'mongodump' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        binary: 'mongodump'
      });
    });

    it('mongodump', () => {
      // prepare
      const methodName = 'mongodump';

      // execute
      Communicator.call({ methodName, args: { args: true }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        args: {}
      });
    });

    it('mongorestore', () => {
      // prepare
      const methodName = 'mongorestore';

      // execute
      Communicator.call({ methodName, args: { args: { asd: true, out: 'sercan' } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        args: { asd: true, out: 'sercan' }
      });
    });

    it('mongoexport', () => {
      // prepare
      const methodName = 'mongoexport';

      // execute
      Communicator.call({ methodName, args: { args: { asd: true, out: 'sercan' } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        args: { asd: true, out: 'sercan' }
      });
    });

    it('mongoimport', () => {
      // prepare
      const methodName = 'mongoimport';

      // execute
      Communicator.call({ methodName, args: { args: { asd: true, out: 'sercan' }, x: false, y: true }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        args: { asd: true, out: 'sercan' }
      });
    });

    it('getDatabases', () => {
      // prepare
      const methodName = 'getDatabases';

      // execute
      Communicator.call({ methodName, args: { test: 123 }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('dbStats', () => {
      // prepare
      const methodName = 'dbStats';

      // execute
      Communicator.call({ methodName, args: { test: 123 }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('serverStatus', () => {
      // prepare
      const methodName = 'serverStatus';

      // execute
      Communicator.call({ methodName, args: { test: 123, name: 'sercan', surname: 'ozdemir', x: {}, y: [] }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('top', () => {
      // prepare
      const methodName = 'top';

      // execute
      Communicator.call({ methodName, args: { name: 'sercan' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('handleSubscriber', () => {
      // prepare
      const methodName = 'handleSubscriber';

      // execute
      Communicator.call({ methodName, args: { email: 'ozdemirsercan27@gmail.com' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        email: 'ozdemirsercan27@gmail.com'
      });
    });

    it('getFile', () => {
      // prepare
      const methodName = 'getFile';

      // execute
      Communicator.call({ methodName, args: { bucketName: true, fileId: '123' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        bucketName: 'fs',
        fileId: '123'
      });
    });

    it('getFilesInfo', () => {
      // prepare
      const methodName = 'getFilesInfo';

      // execute
      Communicator.call({ methodName, args: { bucketName: 'xx', selector: true, limit: 30 }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        bucketName: 'xx',
        selector: {},
        limit: 30
      });
    });

    it('deleteFiles', () => {
      // prepare
      const methodName = 'deleteFiles';

      // execute
      Communicator.call({ methodName, args: { bucketName: 'fss', name: 'sercan' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        bucketName: 'fss',
        selector: {}
      });
    });

    it('deleteFile', () => {
      // prepare
      const methodName = 'deleteFile';

      // execute
      Communicator.call({ methodName, args: { }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        bucketName: 'fs',
        fileId: ''
      });
    });

    it('uploadFile', () => {
      // prepare
      const methodName = 'uploadFile';

      // execute
      Communicator.call({ methodName, args: { blob: [{ some_byte_array: 123 }], fileName: 'sercan', contentType: 'application/json', name: 'sercan' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        bucketName: 'fs',
        blob: [{ some_byte_array: 123 }],
        fileName: 'sercan',
        contentType: 'application/json',
        metaData: {},
        aliases: []
      });
    });

    it('indexInformation', () => {
      // prepare
      const methodName = 'indexInformation';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'sercan', isFull: true }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'sercan',
        isFull: true
      });
    });

    it('dropIndex', () => {
      // prepare
      const methodName = 'dropIndex';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: true, indexName: 'sss' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: '',
        indexName: 'sss'
      });
    });

    it('executeShellCommand', () => {
      // prepare
      const methodName = 'executeShellCommand';

      // execute
      Communicator.call({ methodName, args: { command: 'show collections', connectionId: '123' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        command: 'show collections',
        connectionId: '123',
        username: '',
        password: ''
      });
    });

    it('clearShell', () => {
      // prepare
      const methodName = 'clearShell';

      // execute
      Communicator.call({ methodName, args: { command: 'show collections', connectionId: '123' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('connectToShell', () => {
      // prepare
      const methodName = 'connectToShell';

      // execute
      Communicator.call({ methodName, args: { connectionId: 'ttt', username: 's', password: 123 }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        connectionId: 'ttt',
        username: 's',
        password: ''
      });
    });

    it('removeSchemaAnalyzeResult', () => {
      // prepare
      const methodName = 'removeSchemaAnalyzeResult';

      // execute
      Communicator.call({ methodName, args: { sercan: true }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('analyzeSchema', () => {
      // prepare
      const methodName = 'analyzeSchema';

      // execute
      Communicator.call({ methodName, args: { connectionId: '123', collection: 'sercan' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        connectionId: '123',
        username: '',
        password: '',
        collection: 'sercan'
      });
    });

    it('updateSettings', () => {
      // prepare
      const methodName = 'updateSettings';

      // execute
      Communicator.call({ methodName, args: { settings: { asd: true } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        settings: { asd: true }
      });
    });

    it('insertMany', () => {
      // prepare
      const methodName = 'insertMany';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 123, docs: [{ asd: true }], options: { upsert: true } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: '',
        docs: [{ asd: true }],
        options: { upsert: true }
      });
    });

    it('getActionInfo', () => {
      // prepare
      const methodName = 'getActionInfo';

      // execute
      Communicator.call({ methodName, args: { action: '123' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        action: '123'
      });
    });

    it('getResourceInfo', () => {
      // prepare
      const methodName = 'getResourceInfo';

      // execute
      Communicator.call({ methodName, args: { resource: 'anyResource', name: 'sercan' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        resource: 'anyResource'
      });
    });

    it('getRoleInfo', () => {
      // prepare
      const methodName = 'getRoleInfo';

      // execute
      Communicator.call({ methodName, args: { roleName: 'sercanRole', name: 'sercan' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        roleName: 'sercanRole'
      });
    });

    it('getAllActions', () => {
      // prepare
      const methodName = 'getAllActions';

      // execute
      Communicator.call({ methodName, args: { }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('addUser', () => {
      // prepare
      const methodName = 'addUser';

      // execute
      Communicator.call({ methodName, args: { username: 'sercan', password: '123', options: true, runOnAdminDB: 123 }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        username: 'sercan',
        password: '123',
        options: {},
        runOnAdminDB: false
      });
    });

    it('buildInfo', () => {
      // prepare
      const methodName = 'buildInfo';

      // execute
      Communicator.call({ methodName, args: { runOnAdminDB: 123 }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('ping', () => {
      // prepare
      const methodName = 'ping';

      // execute
      Communicator.call({ methodName, args: { runOnAdminDB: 123 }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('profilingInfo', () => {
      // prepare
      const methodName = 'profilingInfo';

      // execute
      Communicator.call({ methodName, args: { runOnAdminDB: true }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('removeUser', () => {
      // prepare
      const methodName = 'removeUser';

      // execute
      Communicator.call({ methodName, args: { username: 'sercan', password: 123, runOnAdminDB: true }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        username: 'sercan',
        runOnAdminDB: true
      });
    });

    it('replSetGetStatus', () => {
      // prepare
      const methodName = 'replSetGetStatus';

      // execute
      Communicator.call({ methodName, args: { }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('serverInfo', () => {
      // prepare
      const methodName = 'serverInfo';

      // execute
      Communicator.call({ methodName, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId
      });
    });

    it('setProfilingLevel', () => {
      // prepare
      const methodName = 'setProfilingLevel';

      // execute
      Communicator.call({ methodName, args: { name: 'sercan', level: 123 }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        level: ''
      });
    });

    it('validateCollection', () => {
      // prepare
      const methodName = 'validateCollection';

      // execute
      Communicator.call({ methodName, args: { collectionName: 'sercan', options: {} }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        collectionName: 'sercan',
        options: {}
      });
    });

    it('bulkWrite', () => {
      // prepare
      const methodName = 'bulkWrite';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'sercan', options: { test: 123 } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'sercan',
        operations: [],
        options: { test: 123 }
      });
    });

    it('createIndex', () => {
      // prepare
      const methodName = 'createIndex';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'sercan', fields: [{ xx: 1, yy: -1, zz: '$text' }] }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'sercan',
        fields: [{ xx: 1, yy: -1, zz: '$text' }],
        options: {}
      });
    });

    it('distinct', () => {
      // prepare
      const methodName = 'distinct';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'xxx', selector: { name: 'sercan' }, fieldName: 'sercan' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'xxx',
        selector: { name: 'sercan' },
        fieldName: 'sercan',
        options: {}
      });
    });

    it('findOne', () => {
      // prepare
      const methodName = 'findOne';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'tugce', selector: { name: 'sercan' }, cursorOptions: { limit: 50 }, begin: 1 }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'tugce',
        selector: { name: 'sercan' },
        cursorOptions: { limit: 50 }
      });
    });

    it('findOneAndDelete', () => {
      // prepare
      const methodName = 'findOneAndDelete';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'sercan', selector: { x: true } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'sercan',
        selector: { x: true },
        options: {}
      });
    });

    it('findOneAndReplace', () => {
      // prepare
      const methodName = 'findOneAndReplace';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'sercan', selector: { x: true }, setObject: { test: 123 } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'sercan',
        selector: { x: true },
        options: {},
        setObject: { test: 123 }
      });
    });

    it('findOneAndUpdate', () => {
      // prepare
      const methodName = 'findOneAndUpdate';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'sercan', selector: { x: true }, setObject: { test: 123 }, asd: 'asd', options: { skip: 50 } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'sercan',
        selector: { x: true },
        options: { skip: 50 },
        setObject: { test: 123 }
      });
    });

    it('geoHaystackSearch', () => {
      // prepare
      const methodName = 'geoHaystackSearch';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'sercan', xAxis: 50, yAxis: 30 }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'sercan',
        xAxis: 50,
        yAxis: 30,
        options: {}
      });
    });

    it('group', () => {
      // prepare
      const methodName = 'group';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'ttt', keys: [], condition: { x: 1 }, finalize: { asd: 123 }, command: { xx: true } }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'ttt',
        keys: [],
        condition: { x: 1 },
        finalize: { asd: 123 },
        command: { xx: true },
        initial: {},
        reduce: {}
      });
    });

    it('isCapped', () => {
      // prepare
      const methodName = 'isCapped';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'tt', name: 'sercan' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'tt'
      });
    });

    it('mapReduce', () => {
      // prepare
      const methodName = 'mapReduce';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'tt' }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'tt',
        map: {},
        reduce: {},
        options: {}
      });
    });

    it('options', () => {
      // prepare
      const methodName = 'options';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'x', t: 123 }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'x'
      });
    });

    it('reIndex', () => {
      // prepare
      const methodName = 'reIndex';

      // execute
      Communicator.call({ methodName, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: ''
      });
    });

    it('updateMany', () => {
      // prepare
      const methodName = 'updateMany';

      // execute
      Communicator.call({ methodName, args: { selectedCollection: 'sercan', selector: { name: 'tugce' }, setObject: { surname: 'ozdemir' }, options: {} }, callback() {} });

      // verify
      assertExecution(methodName);
      expect(Meteor.call.getCall(0).args[1]).to.eql({
        sessionId: Meteor.default_connection._lastSessionId,
        selectedCollection: 'sercan',
        selector: { name: 'tugce' },
        setObject: { surname: 'ozdemir' },
        options: {}
      });
    });
  });
});
