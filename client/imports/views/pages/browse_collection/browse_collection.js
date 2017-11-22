/**
 * Created by RSercan on 29.12.2015.
 */
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { QueryRender, Editor } from '/client/imports/ui';
import { Enums, SessionManager, Notification } from '/client/imports/modules';
import '/client/imports/views/query_templates/collection/aggregate/aggregate';
import '/client/imports/views/query_templates/collection/bulk_write/bulk_write';
import '/client/imports/views/query_templates/collection/count/count';
import '/client/imports/views/query_templates/collection/create_index/create_index';
import '/client/imports/views/query_templates/collection/delete/delete';
import '/client/imports/views/query_templates/collection/distinct/distinct';
import '/client/imports/views/query_templates/collection/drop_index/drop_index';
import '/client/imports/views/query_templates/collection/find/find';
import '/client/imports/views/query_templates/collection/findone/findone';
import '/client/imports/views/query_templates/collection/findone_and_delete/findone_and_delete';
import '/client/imports/views/query_templates/collection/findone_and_replace/findone_and_replace';
import '/client/imports/views/query_templates/collection/findone_and_update/findone_and_update';
import '/client/imports/views/query_templates/collection/geo_haystack_search/geo_haystack_search';
import '/client/imports/views/query_templates/collection/geo_near/geo_near';
import '/client/imports/views/query_templates/collection/index_information/index_information';
import '/client/imports/views/query_templates/collection/insert_many/insert_many';
import '/client/imports/views/query_templates/collection/is_capped/isCapped';
import '/client/imports/views/query_templates/collection/map_reduce/map_reduce';
import '/client/imports/views/query_templates/collection/options/options';
import '/client/imports/views/query_templates/collection/re_index/re_index';
import '/client/imports/views/query_templates/collection/rename/rename';
import '/client/imports/views/query_templates/collection/stats/stats';
import '/client/imports/views/query_templates/collection/update_many/update_many';
import '/client/imports/views/query_templates/collection/update_one/update_one';
import '/client/imports/views/query_templates/collection/group/group';
import '../../query_templates/collection/find/query_wizard/query_wizard';
import './browse_collection.html';


Template.browseCollection.onCreated(() => {
  SessionManager.set(SessionManager.strSessionSelectedOptions, []);
  SessionManager.set(SessionManager.strSessionSelectedQuery, Enums.QUERY_TYPES.FIND);
});

Template.browseCollection.onRendered(function () {
  if (!SessionManager.get(SessionManager.strSessionSelectedCollection)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  this.subscribe('settings');
  this.subscribe('connections');
  this.subscribe('queryHistories');
  this.subscribe('mongoclient_update');

  QueryRender.init();
});

Template.browseCollection.events({
  'click #btnQueryWizard': function (event) {
    event.preventDefault();
    $('#queryWizardModal').modal('show');
  },

  'click #btnSaveFindOne': function (event) {
    event.preventDefault();
    Editor.saveEditor();
  },

  'click #btnSaveFind': function (event) {
    event.preventDefault();
    Editor.saveFindEditor();
  },

  'click #btnDelFindOne': function (event) {
    event.preventDefault();
    Editor.deleteDocument();
  },

  'click #btnExportAsCSV': function () {
    Template.find.executeQuery(null, 'CSV');
  },

  'click #btnExportAsJSON': function () {
    Template.find.executeQuery(null, 'JSON');
  },

  'click #btnShowQueryHistories': function () {
    $('#queryHistoriesModal').modal('show');
  },

  'change #cmbQueries': function () {
    QueryRender.cmbQueriesChangeEvent();
  },

  'click #btnSwitchView': function () {
    QueryRender.switchView();
  },

  'click #btnExecuteQuery': function () {
    const queryTemplate = SessionManager.get(SessionManager.strSessionSelectedQuery);
    if (queryTemplate) Template[queryTemplate].executeQuery();
    else Notification.warning('Select Query', 'Please select a query first ');
  },
});

Template.browseCollection.helpers({
  getQueryTemplate() {
    return SessionManager.get(SessionManager.strSessionSelectedQuery);
  },

  getHelpBlockForSelectedQuery() {
    switch (SessionManager.get(SessionManager.strSessionSelectedQuery)) {
      case Enums.QUERY_TYPES.FINDONE_AND_REPLACE:
        return 'This query replaces whole document which matched by <strong>selector</strong> with the <strong>set</strong> object';

      case Enums.QUERY_TYPES.GROUP:
        return '<strong>Deprecated since version 3.4</strong> Use db.collection.aggregate() with the $group stage or db.collection.mapReduce() instead';

      case Enums.QUERY_TYPES.FINDONE_AND_DELETE:
        return '<strong><span style="color: red; ">CAUTION:</span></strong> This query removes whole document which matched by <strong>selector</strong>';

      case Enums.QUERY_TYPES.CREATE_INDEX:
        return 'Since mongodb version <strong>3.0.0</strong>, this query can be used instead of <strong>ensureIndex</strong>';

      case Enums.QUERY_TYPES.DELETE:
        return '<strong><span style="color: red; ">CAUTION:</span></strong> This query removes whole document(s) which matched by <strong>selector</strong>';

      case Enums.QUERY_TYPES.GEO_HAYSTACK_SEARCH:
        return 'This query executes a geo search using a <strong>geo haystack index</strong> on a collection';

      case Enums.QUERY_TYPES.IS_CAPPED:
        return 'Returns the information of if the collection is a <strong>capped</strong> collection';

      case Enums.QUERY_TYPES.OPTIONS:
        return 'Returns <strong>collection</strong> options';

      case Enums.QUERY_TYPES.RE_INDEX:
        return 'Reindex all indexes on the collection <strong>Warning:</strong> reIndex is a blocking operation <i>(indexes are rebuilt in the foreground)</i> and will be slow for large collections';

      case Enums.QUERY_TYPES.UPDATE_MANY:
        return 'Updates all documents which matched by <strong>Selector</strong>';

      default:
        return '';
    }
  },

});
