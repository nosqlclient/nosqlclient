import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SessionManager } from '/client/imports/modules';
import { QueryWizard } from '/client/imports/ui';
import './query_wizard.html';


Template.queryWizard.onRendered(() => {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  QueryWizard.init();
});

Template.queryWizard.events({
  'click #btnResetChat': function () {
    QueryWizard.reset();
  },

  'click #btnQueryWizardRespond': function () {
    QueryWizard.respond();
  },

  'click #btnQueryWizardRespond2': function () {
    QueryWizard.respond();
  },
});
