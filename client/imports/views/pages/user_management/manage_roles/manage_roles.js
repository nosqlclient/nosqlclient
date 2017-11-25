import { Template } from 'meteor/templating';
import { SessionManager, UIComponents, Notification } from '/client/imports/modules';
import { UserManagementRoles } from '/client/imports/ui';
import Helper from '/client/imports/helpers/helper';
import './manage_roles.html';

Template.manageRoles.onRendered(() => {
  UIComponents.DataTable.initiateDatatable({ selector: $('#tblRoles'), sessionKey: SessionManager.strSessionUsermanagementRole });
  UIComponents.DataTable.initiateDatatable({ selector: $('#tblRolePrivileges'), sessionKey: SessionManager.strSessionUsermanagementPrivilege });
  UIComponents.DataTable.initiateDatatable({ selector: $('#tblRolesToInherit') });
});

Template.manageRoles.helpers({
  getDB() {
    return SessionManager.get(SessionManager.strSessionUsermanagementManageSelection);
  },

  getRole() {
    return SessionManager.get(SessionManager.strSessionUsermanagementRole);
  },
});

Template.manageRoles.events({
  'click .editor_delete_role': function (event) {
    event.preventDefault();
    UserManagementRoles.deleteRole();
  },

  'click .editor_edit': function (event) {
    event.preventDefault();
    UserManagementRoles.popEditRoleModal();
  },

  'click .editor_edit_privilege': function (event) {
    event.preventDefault();
    UserManagementRoles.startEditingRole();
  },

  'click #btnAddNewPrivilegeToRole': function (event) {
    event.preventDefault();
    UserManagementRoles.addNewPrivilegeToRole();
  },

  'click #btnAddNewInheritRoleToRole': function (event) {
    event.preventDefault();
    UserManagementRoles.addNewInheritRoleToRole();
  },

  'click #btnApplyAddEditRole': function (event) {
    event.preventDefault();
    UserManagementRoles.saveRole();
  },

  'click #btnAddNewRole': function (event) {
    event.preventDefault();

    const inputRoleSelector = $('#inputRoleUM');
    inputRoleSelector.val('');
    inputRoleSelector.prop('disabled', false);

    $('#addEditRoleModalTitle').text(Helper.translate({ key: 'add-role' }));
    $('#tblRolePrivileges').DataTable().clear().draw();
    $('#tblRolesToInherit').DataTable().clear().draw();
  },

  'change #cmbPrivilegeResource': function () {
    const db = $('#cmbPrivilegeResource').find(':selected').text();
    if (db && db !== 'anyResource' && db !== 'cluster') {
      Notification.start('#btnApplyAddPrivilegeToRole');
      UserManagementRoles.initCollectionsForPrivilege(null, db, true);
    } else {
      const cmb = $('#cmbPrivilegeCollection');
      cmb.empty();
      cmb.val('').trigger('chosen:updated');
    }
  },

  'click #btnApplyAddPrivilegeToRole': function (event) {
    event.preventDefault();
    UserManagementRoles.applyPrivilegeToRole();
  },

  'click #btnAddInheritRole': function (event) {
    event.preventDefault();
    UserManagementRoles.addInheritRole();
  }

});
