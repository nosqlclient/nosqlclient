import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums, SessionManager } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/explain/explain';
import './find.html';

Template.find.onRendered(() => {
  Querying.initOptions(Enums.CURSOR_OPTIONS);

  $('#cmbFindCursorOptions').val('LIMIT').trigger('chosen:updated');
  SessionManager.set(SessionManager.strSessionSelectedOptions, ['LIMIT']);
});

Template.find.executeQuery = Querying.Collection.Find.execute;
Template.find.renderQuery = Querying.Collection.Find.render;
