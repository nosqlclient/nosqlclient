import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './repl_set_get_status.html';

Template.replSetGetStatus.onRendered(() => {
  Querying.setVisibilityOfRunOnAdminCheckbox(false);
});

Template.replSetGetStatus.executeQuery = Querying.Admin.executeReplSetGetStatusQuery.bind(Querying.Admin);
