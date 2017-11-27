import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SessionManager } from '/client/imports/modules';
import { SchemaAnalyzer } from '/client/imports/ui';
import Helper from '/client/imports/helpers/helper';
import './schema_analyzer.html';

Template.schemaAnalyzer.onRendered(function () {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  const settings = this.subscribe('settings');
  const connections = this.subscribe('connections');
  const schemaAnalyzeResult = this.subscribe('schema_analyze_result');

  this.autorun(() => {
    if (connections.ready() && settings.ready() && schemaAnalyzeResult.ready()) SchemaAnalyzer.init();
  });
});

Template.schemaAnalyzer.helpers({
  getPageHeading() {
    return Helper.translate({ key: 'schema_analyzer' });
  }
});

Template.schemaAnalyzer.onDestroyed(() => {
  SchemaAnalyzer.clear();
});

Template.schemaAnalyzer.events({
  'click #btnAnalyzeNow': function () {
    SchemaAnalyzer.analyze();
  }

});
