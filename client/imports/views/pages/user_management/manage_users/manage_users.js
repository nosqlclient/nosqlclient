import { Template } from 'meteor/templating';
import { UserManagementUsers } from '/client/imports/ui';
import { SessionManager, UIComponents } from '/client/imports/modules';

import './manage_users.html';

Template.manageUsers.onRendered(() => {
  UIComponents.DataTable.initiateDatatable({ selector: $('#tblUsers'), sessionKey: SessionManager.strSessionUsermanagementUser });
  UIComponents.DataTable.initiateDatatable({ selector: $('#tblUserRoles') });
  UserManagementUsers.initiateRoleToAddTable();

  $('a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
    const target = $(e.target).attr('href');
    if (target === '#tab-2') UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divCustomData'), txtAreaId: 'txtCustomData' });
  });
});

Template.manageUsers.helpers({
  getDB() {
    return SessionManager.get(SessionManager.strSessionUsermanagementManageSelection);
  },

  getUser() {
    return SessionManager.get(SessionManager.strSessionUsermanagementUser);
  },
});

Template.manageUsers.events({
  'click .editor_delete_user': function (event) {
    event.preventDefault();
    UserManagementUsers.deleteUser();
  },

  'click .editor_show_custom_data': function (event) {
    event.preventDefault();
    UserManagementUsers.showCustomData();
  },

  'click #btnApplyAddEditUser': function (event) {
    event.preventDefault();
    UserManagementUsers.saveUser();
  },

  'click #btnApplyAddRoleToUser': function (event) {
    event.preventDefault();
    UserManagementUsers.addRoleToUser();
  },

  'click #btnAddNewRoleToUser': function (event) {
    event.preventDefault();
    UserManagementUsers.applyNewRoleToUser();
  },

  'click #btnAddNewUser': function (event) {
    event.preventDefault();

    const inputUsernameSelector = $('#inputUsernameUM');
    const inputPasswordSelector = $('#inputPasswordUM');
    $('#tblUserRoles').DataTable().clear().draw();
    inputUsernameSelector.val('');
    inputUsernameSelector.prop('disabled', false);
    inputPasswordSelector.val('');
    inputPasswordSelector.attr('placeholder', 'Password');

    $('#addEditUserModalTitle').text('Add User');
    $('.nav-tabs a[href="#tab-1"]').tab('show');
    UIComponents.Editor.setCodeMirrorValue($('#divCustomData'), '');
  },

  'click .editor_edit': function (event) {
    event.preventDefault();
    UserManagementUsers.popEditUserModal();
  },
});
