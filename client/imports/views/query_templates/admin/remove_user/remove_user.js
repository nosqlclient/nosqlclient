import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import '/client/imports/views/query_templates_options/username/username.html';
import './remove_user.html';

Template.removeUser.onRendered(() => {
  Querying.setVisibilityOfRunOnAdminCheckbox(true);
});

Template.removeUser.executeQuery = Querying.Admin.executeRemoveUserQuery;
