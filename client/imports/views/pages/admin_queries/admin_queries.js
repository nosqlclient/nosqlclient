import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Helper from '/client/imports/helper';
import { Settings } from '/lib/imports/collections';
import Enums from '/lib/imports/enums';
import { AceEditor } from 'meteor/arch:ace-editor';


// queries
import '/client/imports/views/query_templates/admin/add_user/add_user';
import '/client/imports/views/query_templates/admin/build_info/build_info';
import '/client/imports/views/query_templates/admin/command/command';
import '/client/imports/views/query_templates/admin/list_databases/list_databases';
import '/client/imports/views/query_templates/admin/ping/ping';
import '/client/imports/views/query_templates/admin/profiling_info/profiling_info';
import '/client/imports/views/query_templates/admin/remove_user/remove_user';
import '/client/imports/views/query_templates/admin/repl_set_get_status/repl_set_get_status';
import '/client/imports/views/query_templates/admin/server_info/server_info';
import '/client/imports/views/query_templates/admin/server_status/server_status';
import '/client/imports/views/query_templates/admin/set_profiling_level/set_profiling_level';
import '/client/imports/views/query_templates/admin/validate_collection/validate_collection';

import './admin_queries.html';

const toastr = require('toastr');
const Ladda = require('ladda');
const JSONEditor = require('jsoneditor');
/**
 * Created by RSercan on 10.1.2016.
 */


Template.adminQueries.onRendered(function () {
  if (Session.get(Helper.strSessionCollectionNames) == undefined) {
    FlowRouter.go('/databaseStats');
    return;
  }

  const settings = this.subscribe('settings');
  const connections = this.subscribe('connections');

  this.autorun(() => {
    if (connections.ready() && settings.ready()) {
      const cmb = $('#cmbAdminQueries');
      cmb.append($("<optgroup id='optGroupAdminQueries' label='Admin Queries'></optgroup>"));
      const cmbOptGroupCollection = cmb.find('#optGroupAdminQueries');

      $.each(Helper.sortObjectByKey(Enums.ADMIN_QUERY_TYPES), (key, value) => {
        cmbOptGroupCollection.append($('<option></option>')
          .attr('value', key)
          .text(value));
      });
      cmb.chosen();

      $('#aRunOnAdminDB').iCheck({
        checkboxClass: 'icheckbox_square-green',
      });

      $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
    }
  });
});


Template.adminQueries.events({
  'change #cmbAdminQueries': function () {
    Session.set(Helper.strSessionSelectedOptions, []);

    const value = $('#cmbAdminQueries').find(':selected').text();
    if (value) {
      Session.set(Helper.strSessionSelectedQuery, value);
    }
  },

  'click #btnSwitchView': function () {
    const jsonView = $('#divJsonEditor');
    const aceView = $('#divAceEditor');

    if (jsonView.css('display') == 'none' && aceView.css('display') == 'none') {
      return;
    }

    if (jsonView.css('display') == 'none') {
      aceView.hide();
      jsonView.show('slow');
    } else {
      jsonView.hide();
      aceView.show('slow');
    }
  },
  'click #btnExecuteAdminQuery': function () {
    const queryTemplate = Session.get(Helper.strSessionSelectedQuery);
    if (queryTemplate) {
      Template[queryTemplate].executeQuery();
    } else {
      toastr.warning('Select Query', 'Please select a query first ');
    }
  },
});

Template.adminQueries.helpers({
  getQueryTemplate() {
    return Session.get(Helper.strSessionSelectedQuery);
  },

  getHelpBlockForSelectedQuery() {
    switch (Session.get(Helper.strSessionSelectedQuery)) {
      case Enums.ADMIN_QUERY_TYPES.ADD_USER:
        return 'Add a user to the database';

      case Enums.ADMIN_QUERY_TYPES.BUILD_INFO:
        return 'Retrieve the server information for the current instance of the db client';

      case Enums.ADMIN_QUERY_TYPES.LIST_DATABASES:
        return 'List the available databases';

      case Enums.ADMIN_QUERY_TYPES.COMMAND:
        return 'Execute a command';

      case Enums.ADMIN_QUERY_TYPES.PING:
        return 'Ping the server and retrieve results';

      case Enums.ADMIN_QUERY_TYPES.PROFILING_INFO:
        return 'Retrive the current profiling information';

      case Enums.ADMIN_QUERY_TYPES.REPL_SET_GET_STATUS:
        return 'Get <strong>ReplicaSet</strong> status';

      case Enums.ADMIN_QUERY_TYPES.SERVER_STATUS:
        return 'Retrieve this <strong>db\'s</strong> server status.';

      case Enums.ADMIN_QUERY_TYPES.SET_PROFILING_LEVEL:
        return 'Set the current profiling level';

      case Enums.ADMIN_QUERY_TYPES.VALIDATE_COLLECTION:
        return 'Validate an existing collection';

      default:
        return '';
    }
  },
});

export const initExecuteQuery = function () {
  Ladda.create(document.querySelector('#btnExecuteAdminQuery')).start();
};

export const setAdminResult = function (result) {
  // set json editor
  getEditor().set(result);

  // set ace editor
  AceEditor.instance('aceeditor', {
    mode: 'javascript',
    theme: 'dawn',
  }, (editor) => {
    editor.$blockScrolling = Infinity;
    editor.setOptions({
      fontSize: '12pt',
      showPrintMargin: false,
    });
    editor.setValue(JSON.stringify(result, null, '\t'), -1);
  });

  const jsonEditor = $('#divJsonEditor');
  const aceEditor = $('#divAceEditor');
  if (jsonEditor.css('display') == 'none' && aceEditor.css('display') == 'none') {
    const settings = Settings.findOne();
    if (settings.defaultResultView == 'Jsoneditor') {
      jsonEditor.show('slow');
    } else {
      aceEditor.show('slow');
    }
  }
};

let jsonEditor;
const getEditor = function () {
  if ($('.jsoneditor').length == 0) {
    jsonEditor = new JSONEditor(document.getElementById('jsoneditor'), {
      mode: 'tree',
      modes: ['code', 'form', 'text', 'tree', 'view'],
      search: true,
    });
  }
  return jsonEditor;
};
