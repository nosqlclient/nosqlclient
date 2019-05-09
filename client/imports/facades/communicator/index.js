import { Meteor } from 'meteor/meteor';

const Communicator = function () {
  this.methods = {
    count: { selectedCollection: '', selector: {}, options: {} },
    find: { selectedCollection: '', selector: {}, cursorOptions: {}, executeExplain: false },
    dropAllCollections: { },
    delete: { selectedCollection: '', selector: {} },
    dropCollection: { selectedCollection: '' },
    connect: { connectionId: '', username: '', password: '' },
    dropDB: { },
    aggregate: { selectedCollection: '', pipeline: [], options: {} },
    listCollectionNames: { dbName: '' },
    createCollection: { collectionName: '', options: {} },
    command: { command: {}, runOnAdminDB: false, options: {} },
    rename: { selectedCollection: '', newName: '', options: {} },
    stats: { selectedCollection: '', options: {} },
    importMongoclient: { file: {} },
    listDatabases: { },
    saveConnection: { connection: {} },
    disconnect: { },
    parseUrl: { connection: {} },
    removeConnection: { connectionId: '' },
    checkAndSaveConnection: { connection: {} },
    saveQueryHistory: { history: {} },
    saveFindResult: { selectedCollection: '', updateObjects: [], deletedObjectIds: [], addedObjects: [] },
    updateOne: { selectedCollection: '', selector: {}, setObject: {}, options: {} },
    checkMongoclientVersion: {},
    removeDumpLogs: { binary: '' },
    mongodump: { args: {} },
    mongorestore: { args: {} },
    mongoexport: { args: {} },
    mongoimport: { args: {} },
    getDatabases: { },
    dbStats: { },
    serverStatus: { },
    top: { },
    handleSubscriber: { email: '' },
    getFile: { bucketName: 'fs', fileId: '' },
    getFilesInfo: { bucketName: 'fs', selector: {}, limit: 50 },
    deleteFiles: { bucketName: 'fs', selector: {} },
    deleteFile: { bucketName: 'fs', fileId: '' },
    uploadFile: { bucketName: 'fs', blob: new Uint8Array(), fileName: '', contentType: '', metaData: {}, aliases: [] },
    indexInformation: { selectedCollection: '', isFull: false },
    dropIndex: { selectedCollection: '', indexName: '' },
    executeShellCommand: { command: '', connectionId: '', username: '', password: '' },
    clearShell: { },
    connectToShell: { connectionId: '', username: '', password: '' },
    removeSchemaAnalyzeResult: { },
    analyzeSchema: { connectionId: '', username: '', password: '', collection: '' },
    updateSettings: { settings: {} },
    insertMany: { selectedCollection: '', docs: [], options: {} },
    getActionInfo: { action: '' },
    getResourceInfo: { resource: '' },
    getRoleInfo: { roleName: '' },
    getAllActions: {},
    addUser: { username: '', password: '', options: {}, runOnAdminDB: false },
    buildInfo: { },
    ping: { },
    profilingInfo: { },
    removeUser: { username: '', runOnAdminDB: false },
    replSetGetStatus: { },
    serverInfo: { },
    setProfilingLevel: { level: '' },
    validateCollection: { collectionName: '', options: {} },
    bulkWrite: { selectedCollection: '', operations: [], options: {} },
    createIndex: { selectedCollection: '', fields: [], options: {} },
    distinct: { selectedCollection: '', selector: {}, fieldName: '', options: {} },
    findOne: { selectedCollection: '', selector: {}, cursorOptions: {} },
    findOneAndDelete: { selectedCollection: '', selector: {}, options: {} },
    findOneAndReplace: { selectedCollection: '', selector: {}, setObject: {}, options: {} },
    findOneAndUpdate: { selectedCollection: '', selector: {}, setObject: {}, options: {} },
    geoHaystackSearch: { selectedCollection: '', xAxis: 0, yAxis: 0, options: {} },
    group: { selectedCollection: '', keys: [], condition: {}, initial: {}, reduce: {}, finalize: {}, command: {} },
    isCapped: { selectedCollection: '' },
    mapReduce: { selectedCollection: '', map: {}, reduce: {}, options: {} },
    options: { selectedCollection: '' },
    reIndex: { selectedCollection: '' },
    updateMany: { selectedCollection: '', selector: {}, setObject: {}, options: {} }
  };
};

Communicator.prototype = {
  call({ methodName, args = {}, callback }) {
    if (!methodName) return;

    // cleaning wrong type or non-exist properties
    Object.keys(args).forEach((key) => {
      if (Object.keys(this.methods[methodName]).indexOf(key) === -1 || Object.prototype.toString.call(args[key]) !== Object.prototype.toString.call(this.methods[methodName][key])) {
        delete args[key];
      }
    });
    const finalArgs = Object.assign(Object.assign({ sessionId: Meteor.default_connection._lastSessionId }, this.methods[methodName]), args);
    return Meteor.call(methodName, finalArgs, callback);
  },

};

export default new Communicator();
