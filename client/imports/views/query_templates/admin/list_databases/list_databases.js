import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './list_databases.html';

Template.listDatabases.onRendered(() => {
  Querying.setVisibilityOfRunOnAdminCheckbox(false);
});

Template.listDatabases.executeQuery = Querying.Admin.executeListDatabasesQuery;
