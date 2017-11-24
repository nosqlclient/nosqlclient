import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './profiling_info.html';

Template.profilingInfo.onRendered(() => {
  Querying.setVisibilityOfRunOnAdminCheckbox(false);
});

Template.profilingInfo.executeQuery = Querying.Admin.executeProfilingInfoQuery.bind(Querying.Admin);
