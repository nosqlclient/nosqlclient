import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums, SessionManager } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/explain/explain';
import '/client/imports/views/query_templates_options/cursor_options/cursor_options';
import './find.html';

Template.find.onRendered(() => {
  Querying.initOptions(Enums.CURSOR_OPTIONS);

  $('#cmbFindCursorOptions').val(['LIMIT', 'SORT']).trigger('chosen:updated');
  SessionManager.set(SessionManager.strSessionSelectedOptions, ['LIMIT', 'SORT']);
});

Template.find.executeQuery = Querying.Collection.Find.execute.bind(Querying.Collection.Find);
Template.find.renderQuery = Querying.Collection.Find.render.bind(Querying.Collection.Find);
