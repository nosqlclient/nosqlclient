import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { QueryRender, Editor } from '/client/imports/ui';
import { Enums, SessionManager, Notification } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';
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
import '/client/imports/views/query_templates/collection/is_capped/is_capped';
import '/client/imports/views/query_templates/collection/map_reduce/map_reduce';
import '/client/imports/views/query_templates/collection/options/options';
import '/client/imports/views/query_templates/collection/re_index/re_index';
import '/client/imports/views/query_templates/collection/rename/rename';
import '/client/imports/views/query_templates/collection/stats/stats';
import '/client/imports/views/query_templates/collection/update_many/update_many';
import '/client/imports/views/query_templates/collection/update_one/update_one';
import '/client/imports/views/query_templates/collection/group/group';
import '../../query_templates/collection/find/query_wizard/query_wizard';
import './query_histories/query_histories';
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
    QueryRender.executeQuery();
  },
});

Template.browseCollection.helpers({
  getQueryTemplate() {
    return SessionManager.get(SessionManager.strSessionSelectedQuery);
  },

  getHelpBlockForSelectedQuery() {
    switch (SessionManager.get(SessionManager.strSessionSelectedQuery)) {
      case Enums.QUERY_TYPES.FINDONE_AND_REPLACE:
        return Helper.translate({ key: 'findone_replace_help_block' });

      case Enums.QUERY_TYPES.GROUP:
        return Helper.translate({ key: 'group_help_block' });

      case Enums.QUERY_TYPES.FINDONE_AND_DELETE:
        return Helper.translate({ key: 'findone_delete_help_block' });

      case Enums.QUERY_TYPES.CREATE_INDEX:
        return Helper.translate({ key: 'create_index_help_block' });

      case Enums.QUERY_TYPES.DELETE:
        return Helper.translate({ key: 'delete_help_block' });

      case Enums.QUERY_TYPES.GEO_HAYSTACK_SEARCH:
        return Helper.translate({ key: 'geo_haystack_search_help_block' });

      case Enums.QUERY_TYPES.IS_CAPPED:
        return Helper.translate({ key: 'is_capped_help_block' });

      case Enums.QUERY_TYPES.OPTIONS:
        return Helper.translate({ key: 'options_help_block' });

      case Enums.QUERY_TYPES.RE_INDEX:
        return Helper.translate({ key: 're_index_help_block' });

      case Enums.QUERY_TYPES.UPDATE_MANY:
        return Helper.translate({ key: 'update_many_help_block' });

      default:
        return '';
    }
  },

});
