import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './ping.html';

Template.ping.onRendered(() => {
  Querying.setVisibilityOfRunOnAdminCheckbox(false);
});

Template.ping.executeQuery = Querying.Admin.executePingQuery.bind(Querying.Admin);
