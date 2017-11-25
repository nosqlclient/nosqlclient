import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Enums, SessionManager, Notification } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';
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

Template.adminQueries.onRendered(function () {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
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
    SessionManager.set(SessionManager.strSessionSelectedOptions, []);

    const value = $('#cmbAdminQueries').find(':selected').text();
    if (value) SessionManager.set(SessionManager.strSessionSelectedQuery, value);
  },

  'click #btnSwitchView': function () {
    const jsonView = $('#divJsonEditor');
    const aceView = $('#divAceEditor');

    if (jsonView.css('display') === 'none' && aceView.css('display') === 'none') {
      return;
    }

    if (jsonView.css('display') === 'none') {
      aceView.hide();
      jsonView.show('slow');
    } else {
      jsonView.hide();
      aceView.show('slow');
    }
  },
  'click #btnExecuteAdminQuery': function () {
    const queryTemplate = SessionManager.get(SessionManager.strSessionSelectedQuery);
    if (queryTemplate) Template[queryTemplate].executeQuery();
    else Notification.warning('select-query');
  },
});

Template.adminQueries.helpers({
  getQueryTemplate() {
    return SessionManager.get(SessionManager.strSessionSelectedQuery);
  },

  getHelpBlockForSelectedQuery() {
    switch (SessionManager.get(SessionManager.strSessionSelectedQuery)) {
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
  }
});
