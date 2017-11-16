/**
 * Created by RSercan on 17.1.2016.
 */
import { Meteor } from 'meteor/meteor';
import { HttpBasicAuth } from 'meteor/jabbslad:basic-auth';
import { Connection, Settings } from '/server/imports/core';

Meteor.startup(() => {
  if (process.env.MONGOCLIENT_AUTH === 'true') {
    const basicAuth = new HttpBasicAuth(((username, password) => (process.env.MONGOCLIENT_USERNAME === username && process.env.MONGOCLIENT_PASSWORD === password)));
    basicAuth.protect();
  }

  Settings.insertDefault();
  ShellCommands.remove({});
  SchemaAnalyzeResult.remove({});
  Dumps.remove({});
  Connection.migrateConnectionsIfExist();
  Connection.tryInjectDefaultConnection();
});
