import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './server_info.html';

Template.serverInfo.onRendered(() => {
  Querying.setVisibilityOfRunOnAdminCheckbox(false);
});

Template.serverInfo.executeQuery = Querying.Admin.executeServerInfoQuery.bind(Querying.Admin);
