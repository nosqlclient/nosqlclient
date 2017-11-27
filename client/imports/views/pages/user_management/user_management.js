import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SessionManager, Notification } from '/client/imports/modules';
import { UserManagementTree, UserManagementUsers, UserManagementRoles } from '/client/imports/ui';
import Helper from '/client/imports/helpers/helper';
import './manage_users/manage_users';
import './manage_roles/manage_roles';
import './user_management.html';

Template.userManagement.onRendered(function () {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  const settings = this.subscribe('settings');
  const connections = this.subscribe('connections');
  const actions = this.subscribe('actions');

  this.autorun(() => {
    if (settings.ready() && connections.ready() && actions.ready())UserManagementTree.init();
  });
});

Template.userManagement.helpers({
  getPageHeading() {
    return Helper.translate({ key: 'user_management' });
  },

  informationTitle() {
    return SessionManager.get(SessionManager.strSessionSelectionUserManagement);
  },
  informationBody() {
    return SessionManager.get(SessionManager.strSessionUsermanagementInfo);
  },
});

Template.userManagement.events({
  'click #btnRefreshUsers': function (event) {
    event.preventDefault();
    Notification.start('#btnRefreshUsers');
    $('#userTree').jstree('destroy');
    UserManagementTree.initUserTree();
  },

  'click #btnManageUsers': function (event) {
    event.preventDefault();
    UserManagementUsers.initUsers();
  },

  'click #btnManageRoles': function (event) {
    event.preventDefault();
    UserManagementRoles.initRoles();
  },

  'click #btnEditUser': function (event) {
    event.preventDefault();
    if (SessionManager.get(SessionManager.strSessionUsermanagementManageSelection)) {
      UserManagementUsers.popEditUserModal(SessionManager.get(SessionManager.strSessionUsermanagementManageSelection));
    }
  },
});
