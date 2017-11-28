import { Communicator, ReactivityProvider } from '/client/imports/facades';
import { Notification, ErrorHandler, SessionManager } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';

const UserManagementTree = function () {
  this.loading = false;
  this.defaultInformationText = '';
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
    Communicator.call({
      methodName: 'command',
      args: { command, runOnAdminDB },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
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
                  const userInfoCommand = {
                    usersInfo: { user: node.text, db: dbName },
                    showCredentials: true,
                    showPrivileges: true,
                  };

                  Communicator.call({
                    methodName: 'command',
                    args: { command: userInfoCommand, runOnAdminDB },
                    callback: (userInfoCommandError, userInfoCommandResult) => {
                      if (userInfoCommandError || userInfoCommandResult.error) ErrorHandler.showMeteorFuncError(userInfoCommandError, userInfoCommandResult);
                      else callback(self.populateTreeChildrenForRoles(userInfoCommandResult.result.users[0]));
                    }
                  });
                } else if (node.data[0].role) {
                  const roleInfoCommand = {
                    rolesInfo: { role: node.data[0].text, db: dbName },
                    showPrivileges: true,
                    showBuiltinRoles: true,
                  };

                  Communicator.call({
                    methodName: 'command',
                    args: { command: roleInfoCommand, runOnAdminDB },
                    callback: (roleInfoCommandError, roleInfoCommandResult) => {
                      if (roleInfoCommandError || roleInfoCommandResult.error) ErrorHandler.showMeteorFuncError(roleInfoCommandError, roleInfoCommandResult);
                      else callback(self.populateTreeChildrenForPrivileges(roleInfoCommandResult.result.roles[0]));
                    }
                  });
                }
              },
            },
          };

          const tree = $('#userTree');
          tree.jstree(finalObject);

          tree.bind('select_node.jstree', (evt, data) => {
            $('#btnEditUser').hide();
            $('#btnManageUsers').hide();
            $('#btnManageRoles').hide();

            if (this.loading) {
              tree.jstree(true).deselect_node(data.node);
              return;
            }

            const node = data.instance.get_node(data.selected[0]);
            if (node.text === SessionManager.get(SessionManager.strSessionSelectionUserManagement)) return;

            // clear texts
            SessionManager.set(SessionManager.strSessionUsermanagementInfo, '');
            SessionManager.set(SessionManager.strSessionSelectionUserManagement, this.defaultInformationText);

            SessionManager.set(SessionManager.strSessionSelectionUserManagement, this.getNodeInformation(node));
          });
          Notification.stop();
        }
      }
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
    Notification.start('#btnRefreshUsers');
    this.loading = true;

    Communicator.call({
      methodName: 'getResourceInfo',
      args: { resource: resourceType },
      callback: (err, result) => {
        if (err) SessionManager.set(SessionManager.strSessionUsermanagementInfo, err.message);
        else SessionManager.set(SessionManager.strSessionUsermanagementInfo, result);

        this.loading = false;
        Notification.stop();
      }
    });
  },

  getRoleInfo(role) {
    Notification.start('#btnRefreshUsers');
    this.loading = true;

    Communicator.call({
      methodName: 'getRoleInfo',
      args: { roleName: role },
      callback: (err, result) => {
        if (err) SessionManager.set(SessionManager.strSessionUsermanagementInfo, err.message);
        else SessionManager.set(SessionManager.strSessionUsermanagementInfo, result);

        this.loading = false;
        Notification.stop();
      }
    });
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

    if (role.privileges) {
      for (let i = 0; i < role.privileges.length; i += 1) {
        result[0].children.push({
          data: [
            {
              privilege: true,
              privilegeType: this.getPrivilegeType(role.privileges[i].resource),
            },
          ],
          text: this.getPrivilegeText(role.privileges[i].resource),
          icon: 'fa fa-gears',
          children: this.getPrivilegeActions(role.privileges[i].actions),
        });
      }
    }

    if (role.inheritedPrivileges) {
      for (let i = 0; i < role.inheritedPrivileges.length; i += 1) {
        result[1].children.push({
          data: [
            {
              privilege: true,
              privilegeType: this.getPrivilegeType(role.inheritedPrivileges[i].resource),
            },
          ],
          text: this.getPrivilegeText(role.inheritedPrivileges[i].resource),
          icon: 'fa fa-gears',
          children: this.getPrivilegeActions(role.inheritedPrivileges[i].actions),
        });
      }
    }

    return result;
  },

  getPrivilegeActions(actions) {
    if (!actions) {
      return [];
    }

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

    if (user.roles) {
      for (let i = 0; i < user.roles.length; i += 1) {
        result[0].children.push({
          data: [
            {
              role: true,
              text: user.roles[i].role,
            },
          ],
          text: `${user.roles[i].role}@${user.roles[i].db}`,
          icon: 'fa fa-bars',
          children: true,
        });
      }
    }

    if (user.inheritedRoles) {
      for (let i = 0; i < user.inheritedRoles.length; i += 1) {
        result[1].children.push({
          data: [
            {
              role: true,
              text: user.inheritedRoles[i].role,
            },
          ],
          text: `${user.inheritedRoles[i].role}@${user.inheritedRoles[i].db}`,
          icon: 'fa fa-bars',
          children: true,
        });
      }
    }
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
