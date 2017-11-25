import { Communicator, ReactivityProvider } from '/client/imports/facades';
import { Notification, ErrorHandler, SessionManager, UIComponents, ExtendedJSON } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';

const JSONEditor = require('jsoneditor');

const UserManagementUsers = function () {

};

UserManagementUsers.prototype = {
  applyNewRoleToUser() {
    const cmb = $('#cmbDatabasesForAddRoleToUser');
    cmb.append($("<optgroup id='optGroupDatabases' label='Databases'></optgroup>"));
    const cmbOptGroupCollection = cmb.find('#optGroupDatabases');

    Communicator.call({
      methodName: 'getDatabases',
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          for (let i = 0; i < result.result.length; i += 1) {
            cmbOptGroupCollection.append($('<option></option>')
              .attr('value', result.result[i].name)
              .text(result.result[i].name));
          }
        }

        cmb.chosen({
          create_option: true,
          allow_single_deselect: true,
          persistent_create_option: true,
          skip_no_results: true,
        });
      }
    });

    const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
    Communicator.call({
      methodName: 'command',
      args: { command: { rolesInfo: 1, showBuiltinRoles: true }, runOnAdminDB },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          UIComponents.DataTable.setupDatatable({
            selectorString: '#tblCurrentRoles',
            columns: [
              { data: 'role', width: '35%' },
              { data: 'db', width: '45%' },
              { data: 'isBuiltin', width: '20%' },
            ],
            data: result.result.roles
          });
        }
      }
    });
  },

  addRoleToUser() {
    const db = $('#cmbDatabasesForAddRoleToUser').chosen().val();
    const roleName = $('#inputAddRoleToUserRolename').val();
    if (!db) {
      Notification.error('db-required');
      return;
    }
    if (!roleName) {
      Notification.error('role-required');
      return;
    }

    const tableSelector = $('#tblUserRoles').DataTable();
    const currentDatas = tableSelector.rows().data();
    for (let i = 0; i < currentDatas.length; i += 1) {
      if (currentDatas[i].db === db && currentDatas[i].role === roleName) {
        Notification.error('field-exists', null, { fieldName: `${roleName}@${db}` });
        return;
      }
    }

    const objectToAdd = { db, role: roleName };
    if (tableSelector.rows().data().length === 0) this.populateUserRolesTable(null, [objectToAdd]);
    else tableSelector.row.add(objectToAdd).draw();

    Notification.success('added-successfully', null, { fieldName: `<b>${roleName}</b>@${db}` });
  },

  saveUser() {
    const usernameSelector = $('#inputUsernameUM');
    const passwordSelector = $('#inputPasswordUM');
    const titleSelector = $('#addEditUserModalTitle');

    if (!usernameSelector.val()) {
      Notification.warning('username-required');
      return;
    }

    if (!passwordSelector.val() && titleSelector.text() === Helper.translate({ key: 'add-user' })) {
      Notification.warning('password-required');
      return;
    }

    let customData = UIComponents.Editor.getCodeMirrorValue($('#divCustomData'));
    if (customData) {
      customData = ExtendedJSON.convertAndCheckJSON(customData);
      if (customData.ERROR) {
        Notification.error('syntax-error-custom-data', null, { error: customData.ERROR });
        return;
      }
    }

    const command = {};
    if (titleSelector.text() === Helper.translate({ key: 'edit-user' })) command.updateUser = usernameSelector.val();
    else command.createUser = usernameSelector.val();

    command.roles = this.populateUserRolesToSave();

    if (customData) command.customData = customData;
    if (passwordSelector.val()) command.pwd = passwordSelector.val();

    Notification.start('#btnApplyAddEditUser');
    const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

    Communicator.call({
      methodName: 'command',
      args: { command, runOnAdminDB },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          this.initUsers();
          Notification.success('saved-successfully');
          $('#editUserModal').modal('hide');
        }

        Notification.stop();
      }
    });
  },

  showCustomData() {
    Notification.start('#btnCloseUMDB');

    const selectedUser = SessionManager.get(SessionManager.strSessionUsermanagementUser);
    if (selectedUser) {
      const editorDiv = $('#jsonEditorOfCustomData');
      let jsonEditor = editorDiv.data('jsoneditor');
      if (!jsonEditor) {
        jsonEditor = new JSONEditor(document.getElementById('jsonEditorOfCustomData'), {
          mode: 'tree',
          modes: ['code', 'form', 'text', 'tree', 'view'],
          search: true,
        });

        editorDiv.data('jsoneditor', jsonEditor);
      }

      const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });
      const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
      const dbName = runOnAdminDB ? 'admin' : connection.databaseName;

      const userInfoCommand = {
        usersInfo: { user: selectedUser.user, db: dbName },
        showCredentials: true,
        showPrivileges: true,
      };

      Communicator.call({
        methodName: 'command',
        args: { command: userInfoCommand, runOnAdminDB },
        callback: (err, result) => {
          if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
          else {
            const user = result.result.users[0];
            jsonEditor.set(user.customData);
            $('#customDataModal').modal('show');
          }

          Notification.stop();
        }
      });
    }
  },

  deleteUser() {
    if (!SessionManager.get(SessionManager.strSessionUsermanagementUser)) return;

    Notification.modal({
      title: 'are-you-sure',
      text: 'recover-not-possible',
      type: 'warning',
      callback: (isConfirm) => {
        if (isConfirm) {
          Notification.start('#btnCloseUMDB');
          const command = { dropUser: SessionManager.get(SessionManager.strSessionUsermanagementUser).user };
          const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

          Communicator.call({
            methodName: 'command',
            args: { command, runOnAdminDB },
            callback: (err, result) => {
              if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
              else {
                this.initUsers();
                Notification.success('deleted-successfully');
              }
            }
          });
        }
      }
    });
  },

  populateTableData(users) {
    const result = [];
    for (let i = 0; i < users.length; i += 1) {
      const obj = {
        user: users[i].user,
        roles: [],
      };

      for (let j = 0; j < users[i].roles.length; j += 1) obj.roles.push(`<b>${users[i].roles[j].role}</b>@${users[i].roles[j].db}`);
      result.push(obj);
    }

    return result;
  },

  initiateRoleToAddTable() {
    UIComponents.DataTable.initiateDatatable({
      selector: $('#tblCurrentRoles'),
      clickCallback: (table, row) => { $('#inputAddRoleToUserRolename').val(row.data().role); $('#cmbDatabasesForAddRoleToUser').val(row.data().db).trigger('chosen:updated'); },
      noDeleteEvent: false
    });
  },

  populateUserRolesToSave() {
    const result = [];
    const roles = $('#tblUserRoles').DataTable().rows().data();
    for (let i = 0; i < roles.length; i += 1) {
      result.push({
        db: roles[i].db,
        role: roles[i].role,
      });
    }

    return result;
  },

  populateUserRolesTable(roles, dataArray) {
    UIComponents.DataTable.setupDatatable({
      selectorString: '#tblUserRoles',
      data: dataArray || roles,
      columns: [
        { data: 'role', width: '50%' },
        { data: 'db', width: '50%' },
      ],
      columnDefs: [
        {
          targets: [2],
          data: null,
          width: '5%',
          defaultContent: '<a href="" title="Delete" class="editor_delete"><i class="fa fa-remove text-navy"></i></a>',
        }
      ]
    });
  },

  popEditUserModal(user) {
    $('#addEditUserModalTitle').text(Helper.translate({ key: 'edit-user' }));

    Notification.start('#btnCloseUMDB');

    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });
    const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
    const dbName = runOnAdminDB ? 'admin' : connection.databaseName;
    const username = user || SessionManager.get(SessionManager.strSessionUsermanagementUser).user;

    const userInfoCommand = {
      usersInfo: { user: username, db: dbName },
      showCredentials: true,
      showPrivileges: true,
    };

    Communicator.call({
      methodName: 'command',
      args: { command: userInfoCommand, runOnAdminDB },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          $('#editUserModal').modal('show');

          const resultUser = result.result.users[0];
          this.populateUserRolesTable(resultUser.roles);

          const inputUsernameSelector = $('#inputUsernameUM');
          inputUsernameSelector.val(resultUser.user);
          inputUsernameSelector.prop('disabled', true);

          const inputPasswordSelector = $('#inputPasswordUM');
          inputPasswordSelector.val('');
          inputPasswordSelector.attr('placeholder', 'Leave this blank to keep old one');

          if (resultUser.customData) {
            $('.nav-tabs a[href="#tab-2"]').tab('show');
            UIComponents.Editor.setCodeMirrorValue($('#divCustomData'), JSON.stringify(resultUser.customData, null, 1));
          }
        }
        Notification.stop();
      }
    });
  },

  initUsers() {
    Notification.start('#btnCloseUMDB');

    const command = {
      usersInfo: 1,
      showCredentials: true,
    };

    const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

    Communicator.call({
      methodName: 'command',
      args: { command, runOnAdminDB },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          UIComponents.DataTable.setupDatatable({
            data: this.populateTableData(result.result.users),
            selectorString: '#tblUsers',
            columns: [
              { data: 'user', width: '20%' },
              { data: 'roles[, ]', width: '65%' },
            ],
            columnDefs: [
              {
                targets: [2],
                data: null,
                width: '5%',
                defaultContent: '<a href="" title="Show File Info" class="editor_show_custom_data"><i class="fa fa-book text-navy"></i></a>',
              },
              {
                targets: [3],
                data: null,
                width: '5%',
                defaultContent: '<a href="" title="Edit" class="editor_edit"><i class="fa fa-edit text-navy"></i></a>',
              },
              {
                targets: [4],
                data: null,
                width: '5%',
                defaultContent: '<a href="" title="Delete" class="editor_delete_user"><i class="fa fa-remove text-navy"></i></a>',
              },
            ]
          });
        }
        Notification.stop();
      }
    });
  }
};

export default new UserManagementUsers();
