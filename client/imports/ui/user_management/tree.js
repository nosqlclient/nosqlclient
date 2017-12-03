import { Communicator, ReactivityProvider } from '/client/imports/facades';
import { Notification, ErrorHandler, SessionManager } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';

const UserManagementTree = function () {
  this.loading = false;
  this.defaultInformationText = '';
};

const populatePrivileges = function (result, role, key, index) {
  for (let i = 0; i < role[key].length; i += 1) {
    result[index].children.push({
      data: [
        {
          privilege: true,
          privilegeType: this.getPrivilegeType(role[key][i].resource),
        }
      ],
      text: this.getPrivilegeText(role[key][i].resource),
      icon: 'fa fa-gears',
      children: this.getPrivilegeActions(role[key][i].actions),
    });
  }
};

const populateRoles = function (result, user, key, index) {
  for (let i = 0; i < user[key].length; i += 1) {
    result[index].children.push({
      data: [
        {
          role: true,
          text: user[key][i].role,
        },
      ],
      text: `${user[key][i].role}@${user[key][i].db}`,
      icon: 'fa fa-bars',
      children: true,
    });
  }
};

const getInfo = function (args, methodName) {
  Notification.start('#btnRefreshUsers');
  this.loading = true;

  Communicator.call({
    methodName,
    args,
    callback: (err, result) => {
      if (err) SessionManager.set(SessionManager.strSessionUsermanagementInfo, err.message);
      else SessionManager.set(SessionManager.strSessionUsermanagementInfo, result);

      this.loading = false;
      Notification.stop();
    }
  });
};

const executeCommand = function (command, runOnAdminDB, successCallback) {
  Communicator.call({
    methodName: 'command',
    args: { command, runOnAdminDB },
    callback: (err, result) => {
      if (err || (result && result.error)) ErrorHandler.showMeteorFuncError(err, result);
      else successCallback(result);
      Notification.stop();
    }
  });
};

const selectNodeCallback = function (evt, data) {
  $('#btnEditUser').hide();
  $('#btnManageUsers').hide();
  $('#btnManageRoles').hide();

  if (this.loading) {
    $('#userTree').jstree(true).deselect_node(data.node);
    return;
  }

  const node = data.instance.get_node(data.selected[0]);
  if (node.text === SessionManager.get(SessionManager.strSessionSelectionUserManagement)) return;

  // clear texts
  SessionManager.set(SessionManager.strSessionUsermanagementInfo, '');
  SessionManager.set(SessionManager.strSessionSelectionUserManagement, this.defaultInformationText);

  SessionManager.set(SessionManager.strSessionSelectionUserManagement, this.getNodeInformation(node));
};

UserManagementTree.prototype = {
  init() {
    Notification.start('#btnRefreshUsers');

    const chckRunOnAdminDB = $('#aRunOnAdminDBToFetchUsers');
    chckRunOnAdminDB.iCheck({
      checkboxClass: 'icheckbox_square-green',
    });

    chckRunOnAdminDB.iCheck('uncheck');
    this.initUserTree();
  },

  initUserTree() {
    this.defaultInformationText = Helper.translate({ key: 'user_management_default_tree_text' });
    SessionManager.set(SessionManager.strSessionUsermanagementInfo, '');
    SessionManager.set(SessionManager.strSessionSelectionUserManagement, this.defaultInformationText);
    $('#btnEditUser').hide();
    $('#btnManageUsers').hide();
    $('#btnManageRoles').hide();

    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });
    const command = {
      usersInfo: 1,
      showCredentials: true,
    };

    const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
    const self = this;
    executeCommand.call(this, command, runOnAdminDB, (result) => {
      const dbName = runOnAdminDB ? 'admin' : connection.databaseName;
      const children = this.populateTreeChildrenForUsers(result.result.users);
      const finalObject = {
        core: {
          data(node, callback) {
            if (node.id === '#') {
              callback([
                {
                  text: dbName,
                  icon: 'fa fa-database',
                  data: [{ db: true }],
                  state: {
                    opened: true,
                  },
                  children,
                },
              ]);
            } else if (node.data[0].user) {
              executeCommand.call(this, { usersInfo: { user: node.text, db: dbName }, showCredentials: true, showPrivileges: true }, runOnAdminDB, (usersInfoResult) => {
                callback(self.populateTreeChildrenForRoles(usersInfoResult.result.users[0]));
              });
            } else if (node.data[0].role) {
              executeCommand.call(this, { rolesInfo: { role: node.data[0].text, db: dbName }, showPrivileges: true, showBuiltinRoles: true }, runOnAdminDB, (roleInfoCommandResult) => {
                callback(self.populateTreeChildrenForPrivileges(roleInfoCommandResult.result.roles[0]));
              });
            }
          },
        },
      };

      const tree = $('#userTree');
      tree.jstree(finalObject);
      tree.bind('select_node.jstree', selectNodeCallback.bind(this));
      Notification.stop();
    });
  },

  getNodeInformation(node) {
    if (!node.data || node.data[0].db || node.data[0].user) {
      if (!node.data || !node.data[0]) return this.defaultInformationText;

      if (node.data[0].user) {
        SessionManager.set(SessionManager.strSessionUsermanagementManageSelection, node.text);
        $('#btnEditUser').show();
      } else if (node.data[0].db) {
        SessionManager.set(SessionManager.strSessionUsermanagementManageSelection, node.text);
        $('#btnManageUsers').show();
        $('#btnManageRoles').show();
      }

      return this.defaultInformationText;
    }

    if (node.data[0].role) {
      SessionManager.set(SessionManager.strSessionUsermanagementManageSelection, node.data[0].text);
      this.getRoleInfo(node.data[0].text);
    } else if (node.data[0].privilege) this.getResourceInfo(node.data[0].privilegeType);
    else if (node.data[0].action) this.getActionInfo(node.text);

    return node.text;
  },

  getActionInfo(action) {
    Notification.start('#btnRefreshUsers');
    this.loading = true;

    Communicator.call({
      methodName: 'getActionInfo',
      args: { action },
      callback: (err, result) => {
        if (err) SessionManager.set(SessionManager.strSessionUsermanagementInfo, err.message);
        else SessionManager.set(SessionManager.strSessionUsermanagementInfo, result);
        this.loading = false;
        Notification.stop();
      }
    });
  },

  getResourceInfo(resourceType) {
    getInfo.call(this, { resource: resourceType }, 'getResourceInfo');
  },

  getRoleInfo(role) {
    getInfo.call(this, { roleName: role }, 'getRoleInfo');
  },

  populateTreeChildrenForPrivileges(role) {
    if (!role) return [];

    const result = [];
    result.push({
      text: 'Privileges',
      data: [{
        isBuiltin: role.isBuiltin,
      }],
      icon: 'fa fa-list-ul',
      children: [],
    });
    result.push({
      text: 'Inherited Privileges',
      data: [{
        isBuiltin: role.isBuiltin,
      }],
      icon: 'fa fa-list-ul',
      children: [],
    });

    if (role.privileges) populatePrivileges.call(this, result, role, 'privileges', 0);
    if (role.inheritedPrivileges) populatePrivileges.call(this, result, role, 'inheritedPrivileges', 1);

    return result;
  },

  getPrivilegeActions(actions) {
    if (!actions) return [];

    const result = [];
    for (let i = 0; i < actions.length; i += 1) {
      result.push({
        data: [
          {
            action: true,
          },
        ],
        text: actions[i],
        icon: 'fa fa-bolt',
        children: false,
      });
    }

    return result;
  },

  getPrivilegeType(resource) {
    if (!resource) return '';
    if (resource.anyResource) return 'anyResource';
    if (resource.cluster) return 'cluster';
    if (resource.db && resource.collection) return 'db+collection';
    if (resource.db) return 'db';
    if (resource.collection) return 'collection';

    return 'non-system';
  },

  getPrivilegeText(resource) {
    if (!resource) return '';

    const type = this.getPrivilegeType(resource);

    if (type === 'db+collection') return `${resource.db} ${resource.collection}`;
    if (type === 'db') return resource.db;
    if (type === 'collection') return resource.collection;
    if (type === 'non-system') return 'all non-system collections';

    return type;
  },

  populateTreeChildrenForRoles(user) {
    if (!user) {
      return [];
    }
    const result = [];
    result.push({
      text: 'Roles',
      icon: 'fa fa-list-alt',
      children: [],
    });
    result.push({
      text: 'Inherited Roles',
      icon: 'fa fa-list-alt',
      children: [],
    });

    if (user.roles) populateRoles(result, user, 'roles', 0);
    if (user.inheritedRoles) populateRoles(result, user, 'inheritedRoles', 1);

    return result;
  },

  populateTreeChildrenForUsers(users) {
    const result = [];
    for (let i = 0; i < users.length; i += 1) {
      result.push({
        id: users[i]._id,
        text: users[i].user,
        icon: 'fa fa-user',
        data: [
          {
            user: true,
          },
        ],
        children: true,
      });
    }

    return result;
  }
};

export default new UserManagementTree();
