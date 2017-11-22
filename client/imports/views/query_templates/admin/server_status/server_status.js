import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './server_status.html';

Template.serverStatus.onRendered(() => {
  Querying.setVisibilityOfRunOnAdminCheckbox(false);
});

Template.serverStatus.executeQuery = Querying.Admin.executeServerStatusQuery;
