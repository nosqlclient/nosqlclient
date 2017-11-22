import { Template } from 'meteor/templating';
import { SessionManager } from '/client/imports/modules';
import { Backup } from '/client/imports/ui';
import { FlowRouter } from 'meteor/kadira:flow-router';
import './database_dump_restore.html';
import './options/options';

Template.databaseDumpRestore.onDestroyed(() => {
  Backup.removeDumpLogs();
});

Template.databaseDumpRestore.onRendered(function () {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  const settings = this.subscribe('settings');
  const connections = this.subscribe('connections');
  const dumps = this.subscribe('dumps');

  Backup.initializeUI();

  this.autorun(() => {
    if (settings.ready() && connections.ready() && dumps.ready()) Backup.init();
  });
});

Template.databaseDumpRestore.events({
  'click #btnExecuteMongodump': function () {
    Backup.callBinaryMethod('#btnExecuteMongodump', 'mongodump', Backup.getMongodumpArgs);
  },

  'click #btnExecuteMongorestore': function () {
    Backup.callBinaryMethod('#btnExecuteMongorestore', 'mongorestore', Backup.getMongorestoreArgs);
  },

  'click #btnExecuteMongoexport': function () {
    Backup.callBinaryMethod('#btnExecuteMongoexport', 'mongoexport', Backup.getMongoexportArgs());
  },

  'click #btnExecuteMongoimport': function () {
    Backup.callBinaryMethod('#btnExecuteMongoimport', 'mongoimport', Backup.getMongoimportArgs);
  },

  'click #btnClearMongoimportLogs': function () {
    Backup.clearLogs('mongoimport');
  },

  'click #btnClearMongoexportLogs': function () {
    Backup.clearLogs('mongoexport');
  },

  'click #btnClearMongodumpLogs': function () {
    Backup.clearLogs('mongodump');
  },

  'click #btnClearMongorestoreLogs': function () {
    Backup.clearLogs('mongorestore');
  },
});
