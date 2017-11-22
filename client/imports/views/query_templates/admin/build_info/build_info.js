import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './build_info.html';

Template.buildInfo.onRendered(() => {
  Querying.setVisibilityOfRunOnAdminCheckbox(false);
});

Template.buildInfo.executeQuery = Querying.Admin.executeBuildInfoQuery;
