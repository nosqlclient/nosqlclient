import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Enums, SessionManager } from '/client/imports/modules';
import { QueryRender } from '/client/imports/ui';
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
    QueryRender.executeQuery();
  },
});

Template.adminQueries.helpers({
  getPageHeading() {
    return Helper.translate({ key: 'admin_queries' });
  },

  getQueryTemplate() {
    return SessionManager.get(SessionManager.strSessionSelectedQuery);
  },

  getHelpBlockForSelectedQuery() {
    switch (SessionManager.get(SessionManager.strSessionSelectedQuery)) {
      case Enums.ADMIN_QUERY_TYPES.ADD_USER:
        return Helper.translate({ key: 'add_user_help_block' });

      case Enums.ADMIN_QUERY_TYPES.BUILD_INFO:
        return Helper.translate({ key: 'build_info_help_block' });

      case Enums.ADMIN_QUERY_TYPES.LIST_DATABASES:
        return Helper.translate({ key: 'list_dbs_help_block' });

      case Enums.ADMIN_QUERY_TYPES.COMMAND:
        return Helper.translate({ key: 'command_help_block' });

      case Enums.ADMIN_QUERY_TYPES.PING:
        return Helper.translate({ key: 'ping_help_block' });

      case Enums.ADMIN_QUERY_TYPES.PROFILING_INFO:
        return Helper.translate({ key: 'profiling_info_help_block' });

      case Enums.ADMIN_QUERY_TYPES.REPL_SET_GET_STATUS:
        return Helper.translate({ key: 'repl_set_get_status_help_block' });

      case Enums.ADMIN_QUERY_TYPES.SERVER_STATUS:
        return Helper.translate({ key: 'server_status_help_block' });

      case Enums.ADMIN_QUERY_TYPES.SET_PROFILING_LEVEL:
        return Helper.translate({ key: 'set_profiling_level_help_block' });

      case Enums.ADMIN_QUERY_TYPES.VALIDATE_COLLECTION:
        return Helper.translate({ key: 'validate_collection_help_block' });

      default:
        return '';
    }
  }
});
