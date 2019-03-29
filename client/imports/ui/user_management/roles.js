import { Communicator, ReactivityProvider } from '/client/imports/facades';
import { Notification, ErrorHandler, SessionManager, UIComponents } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';
import UsermanagementHelper from './helper';
import { _ } from 'meteor/underscore';
import $ from 'jquery';

const UserManagementRoles = function () {

};

const isBuiltinRole = function () {
  if (SessionManager.get(SessionManager.strSessionUsermanagementRole)
    && SessionManager.get(SessionManager.strSessionUsermanagementRole).isBuiltin && $('#addEditRoleModalTitle').text() === Helper.translate({ key: 'edit_role' })) {
    Notification.warning('builtin-roles-read-only');
    return true;
  }
};

const getActionColumn = function ({ isBuiltin = false, actionType = 'DELETE', targetIndex = 2, editClass = 'editor_edit_privilege', deleteClass = 'editor_delete' }) {
  return {
    targets: [targetIndex],
    data: null,
    width: '5%',
    render(data, type, full) {
      if (isBuiltin || full.isBuiltin) {
        if (actionType === 'VIEW') return `<a href="" title="View" class="${editClass}"><i class="fa fa-eye text-navy"></i></a>`;
        return '<a href="" title="Not Allowed"><i class="fa fa-ban text-navy"></i></a>';
      }
      if (actionType === 'DELETE') return `<a href="" title="Delete" class="${deleteClass}"><i class="fa fa-remove text-navy"></i></a>`;
      return `<a href="" title="Edit" class="${editClass}"><i class="fa fa-edit text-navy"></i></a>`;
    }
  };
};

const initCollectionsCombobox = function (collectionToSelect, selector, stopLadda, data = {}) {
  if (collectionToSelect) data[collectionToSelect] = collectionToSelect;
  UIComponents.Combobox.init({ selector, data, comboGroupLabel: 'Collections' });

  if (collectionToSelect) selector.val(collectionToSelect).trigger('chosen:updated');
  if (stopLadda) Notification.stop();
};

UserManagementRoles.prototype = {
  addInheritRole() {
    const db = $('#cmbDatabasesForInheritRole').val();
    const role = $('#cmbRolesForDBForInheritedRole').val();

    if (!db) {
      Notification.warning('db-required');
      return;
    }
    if (!role) {
      Notification.warning('role-required');
      return;
    }

    const table = $('#tblRolesToInherit').DataTable();
    const currentDatas = table.rows().data();
    for (let i = 0; i < currentDatas.length; i += 1) {
      if (currentDatas[i].db === db && currentDatas[i].role === role) {
        Notification.error('field-exists', null, { fieldName: `${role}@${db}` });
        return;
      }
    }

    const objectToAdd = { role, db };
    if (table.rows().data().length === 0) this.populateRolesToInheritTable(null, [objectToAdd]);
    else table.row.add(objectToAdd).draw();

    Notification.success('added-successfully', null, { fieldName: `<b>${role}</b>@${db}` });
  },

  applyPrivilegeToRole() {
    const cmbPrivilegeSelector = $('#cmbPrivilegeResource');
    const cmbPrivilegeCollection = $('#cmbPrivilegeCollection');

    const actions = $('#cmbActionsOfPrivilege').val();
    let resource = cmbPrivilegeSelector.val() ? cmbPrivilegeSelector.val() : '';
    if (cmbPrivilegeCollection.val() && resource !== 'anyResource' && resource !== 'cluster') {
      if (resource) resource = `<b>${cmbPrivilegeCollection.val()}</b>@${resource}`;
      else resource = `<b>${cmbPrivilegeCollection.val()}</b>`;
    }
    if (!actions) {
      Notification.warning('action-required');
      return;
    }

    const privilegesTableSelector = $('#tblRolePrivileges').DataTable();
    if ($('#addEditPrivilegeModalTitle').text() === Helper.translate({ key: 'edit_privilege' })) {
      // edit existing privilege of role
      const selectedRowData = SessionManager.get(SessionManager.strSessionUsermanagementPrivilege);

      privilegesTableSelector.rows().every(function () {
        const privilegesData = this.data();
        if (_.isEqual(privilegesData.privilege, selectedRowData.privilege)
          && privilegesData.resource === selectedRowData.resource) {
          privilegesData.privilege = actions;
          privilegesData.resource = resource;
        }

        this.invalidate();
        return this;
      });

      privilegesTableSelector.draw();
    } else {
      const objectToAdd = {
        privilege: actions,
        resource,
      };

      if (privilegesTableSelector.rows().data().length === 0) this.populateRolePrivilegesTable(null, [objectToAdd]);
      else privilegesTableSelector.row.add(objectToAdd).draw();
    }

    $('#addPrivilegeToRoleModal').modal('hide');
  },

  saveRole() {
    const titleSelector = $('#addEditRoleModalTitle');
    const roleNameSelector = $('#inputRoleUM');

    if (SessionManager.get(SessionManager.strSessionUsermanagementRole) && SessionManager.get(SessionManager.strSessionUsermanagementRole).isBuiltin
      && titleSelector.text() === Helper.translate({ key: 'edit_role' })) {
      Notification.warning('builtin-roles-read-only');
      return;
    }
    if ($('#tblRolePrivileges').DataTable().rows().data().length === 0) {
      Notification.warning('privilege-required');
      return;
    }
    if (!roleNameSelector.val()) {
      Notification.warning('role-required');
      return;
    }

    const command = {};
    if (titleSelector.text() === 'Edit Role') command.updateRole = roleNameSelector.val();
    else command.createRole = roleNameSelector.val();

    command.privileges = this.populatePrivilegesToSave();
    command.roles = this.populateInheritRolesToSave();

    Notification.start('#btnApplyAddEditRole');

    const runOnAdminDB = UIComponents.Checkbox.getState($('#inputRunOnAdminDBToFetchUsers'));

    Communicator.call({
      methodName: 'command',
      args: { command, runOnAdminDB },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          this.initRoles();
          Notification.success('saved-successfully');

          $('#editRoleModal').modal('hide');
        }
      }
    });
  },

  addNewInheritRoleToRole() {
    if (isBuiltinRole()) return;
    Notification.start('#btnAddInheritRole');

    this.initDatabasesForInheritRole();
    $('#addRoleToInherit').modal('show');
  },

  addNewPrivilegeToRole() {
    if (isBuiltinRole()) return;

    $('#addEditPrivilegeModalTitle').text(Helper.translate({ key: 'add_privilege' }));
    $('#addEditPrivilegeModalText').text(`${SessionManager.get(SessionManager.strSessionUsermanagementRole) ? SessionManager.get(SessionManager.strSessionUsermanagementRole).role : ''}`);

    Notification.start('#btnApplyAddPrivilegeToRole');

    this.initResourcesForPrivileges();
    this.initActionsForPrivilege();

    $('#addPrivilegeToRoleModal').modal('show');
  },

  startEditingRole() {
    if (!SessionManager.get(SessionManager.strSessionUsermanagementPrivilege)) return;

    $('#addEditPrivilegeModalTitle').text(Helper.translate({ key: 'edit_privilege' }));
    $('#addEditPrivilegeModalText').text('');

    Notification.start('#btnApplyAddPrivilegeToRole');

    const selectedResource = SessionManager.get(SessionManager.strSessionUsermanagementPrivilege).resource;
    let dbToSelect = '';
    let collectionToSelect = '';
    if (selectedResource && selectedResource !== 'anyResource' && selectedResource !== 'cluster') {
      if (selectedResource.indexOf('@') !== -1) {
        dbToSelect = selectedResource.substr(selectedResource.indexOf('@') + 1);
        collectionToSelect = selectedResource.substr(0, selectedResource.indexOf('@')).replace('<b>', '').replace('</b>', '');
      } else if (selectedResource.indexOf('<b>') !== -1) collectionToSelect = selectedResource.replace('<b>', '').replace('</b>', '');
      else dbToSelect = selectedResource;
    } else dbToSelect = selectedResource;


    this.initResourcesForPrivileges(dbToSelect, collectionToSelect);
    this.initActionsForPrivilege(SessionManager.get(SessionManager.strSessionUsermanagementPrivilege).privilege);

    $('#addPrivilegeToRoleModal').modal('show');
  },

  popEditRoleModal(role) {
    $('#addEditRoleModalTitle').text(Helper.translate({ key: 'edit_role' }));

    Notification.start('#btnCloseUMRoles');

    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });
    const runOnAdminDB = UIComponents.Checkbox.getState($('#inputRunOnAdminDBToFetchUsers'));
    const dbName = runOnAdminDB ? 'admin' : connection.databaseName;
    const roleName = role || SessionManager.get(SessionManager.strSessionUsermanagementRole).role;

    const rolesInfoCommand = {
      rolesInfo: { role: roleName, db: dbName },
      showPrivileges: true,
    };

    Communicator.call({
      methodName: 'command',
      args: { command: rolesInfoCommand, runOnAdminDB },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          const resultRole = result.result.roles[0];
          this.populateRolePrivilegesTable(resultRole);
          this.populateRolesToInheritTable(resultRole);

          const inputRoleNameSelector = $('#inputRoleUM');
          inputRoleNameSelector.val(resultRole.role);
          inputRoleNameSelector.prop('disabled', true);

          $('#editRoleModal').modal('show');
        }

        Notification.stop();
      }
    });
  },

  populateRolesToInheritTable(role, dataArray) {
    UIComponents.DataTable.setupDatatable({
      selectorString: '#tblRolesToInherit',
      data: dataArray || role.inheritedRoles,
      columns: [
        { data: 'role', width: '50%' },
        { data: 'db', width: '45%' },
      ],
      columnDefs: [getActionColumn({ isBuiltin: role && role.isBuiltin })]
    });
  },

  populateRolePrivilegesTable(role, dataArray) {
    UIComponents.DataTable.setupDatatable({
      selectorString: '#tblRolePrivileges',
      data: dataArray || this.populateTableDataForRole(role),
      columns: [
        { data: 'privilege[, ]', width: '50%' },
        { data: 'resource', width: '40%' },
      ],
      columnDefs: [
        getActionColumn({ isBuiltin: role && role.isBuiltin, actionType: 'EDIT', targetIndex: 2 }),
        getActionColumn({ isBuiltin: role && role.isBuiltin, targetIndex: 3 })
      ]
    });
  },

  populateTableDataForRole(role) {
    const result = [];
    if (role.privileges) {
      for (let i = 0; i < role.privileges.length; i += 1) {
        result.push({
          privilege: role.privileges[i].actions,
          resource: this.getResource(role.privileges[i].resource),
        });
      }
    }

    return result;
  },

  getResource(resource) {
    if (!resource) return '';
    if (resource.anyResource) return 'anyResource';
    if (resource.cluster) return 'cluster';
    if (resource.db && resource.collection) return `<b>${resource.collection}</b>@${resource.db}`;
    if (resource.db) return resource.db;
    if (resource.collection) return `<b>${resource.collection}</b>`;

    return '';
  },

  getResourceObject(resourceString) {
    if (resourceString !== 'anyResource' && resourceString !== 'cluster') {
      const result = {};

      if (resourceString.indexOf('@') !== -1) {
        result.db = resourceString.substr(resourceString.indexOf('@') + 1);
        result.collection = resourceString.substr(0, resourceString.indexOf('@')).replace('<b>', '').replace('</b>', '');
      } else if (resourceString.indexOf('<b>') !== -1) {
        result.collection = resourceString.replace('<b>', '').replace('</b>', '');
        result.db = '';
      } else {
        result.db = resourceString;
        result.collection = '';
      }

      return result;
    } if (resourceString === 'anyResource') return { anyResource: true };
    if (resourceString === 'cluster') return { cluster: true };

    return { db: resourceString };
  },

  initResourcesForPrivileges(dbToSelect, collectionToSelect) {
    Communicator.call({
      methodName: 'getDatabases',
      callback: (err, result) => {
        let data;
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else data = Helper.populateComboboxData(result.result, 'name');

        if (dbToSelect && dbToSelect !== 'anyResource' && dbToSelect !== 'cluster') data[dbToSelect] = dbToSelect;

        const selector = $('#cmbPrivilegeResource');
        UIComponents.Combobox.init({
          selector,
          data,
          comboGroupLabel: 'Databases',
          prependOptions: $("<optgroup id='optAnyResource' label='Any Resource'><option value='anyResource'>anyResource</option></optgroup>"
            + "<optgroup id='optCluster' label='Cluster'><option value='cluster'>cluster</option></optgroup>")
        });
        if (dbToSelect) selector.val(dbToSelect).trigger('chosen:updated');

        this.initCollectionsForPrivilege(collectionToSelect, dbToSelect);
      }
    });
  },

  initCollectionsForPrivilege(collectionToSelect, dbName, stopLadda) {
    const selector = $('#cmbPrivilegeCollection');
    if (dbName) {
      Communicator.call({
        methodName: 'listCollectionNames',
        args: { dbName },
        callback: (err, result) => {
          let data;
          if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
          else data = Helper.populateComboboxData(result.result, 'name');

          initCollectionsCombobox(collectionToSelect, selector, stopLadda, data);
        }
      });
    } else initCollectionsCombobox(collectionToSelect, selector, stopLadda);
  },

  initActionsForPrivilege(actions) {
    Communicator.call({
      methodName: 'getAllActions',
      callback: (err, result) => {
        let data;
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else data = Helper.populateComboboxData(result);
        if (actions) data = Object.assign(data, Helper.populateComboboxData(actions));

        const selector = $('#cmbActionsOfPrivilege');
        UIComponents.Combobox.init({ selector, data, options: { create_option: true, persistent_create_option: true, skip_no_results: true } });

        if (actions) selector.val(actions).trigger('chosen:updated');
        Notification.stop();
      }
    });
  },

  initDatabasesForInheritRole() {
    const selector = $('#cmbDatabasesForInheritRole');

    Communicator.call({
      methodName: 'getDatabases',
      callback: (err, result) => {
        let data;
        if (err || result.error) {
          ErrorHandler.showMeteorFuncError(err, result);
        } else {
          data = Helper.populateComboboxData(result.result, 'name');
        }

        UIComponents.Combobox.init({ selector, data, options: { create_option: true, persistent_create_option: true, skip_no_results: true } });
        this.initRolesForDBForInheritRole();
      }
    });
  },

  initRolesForDBForInheritRole() {
    const runOnAdminDB = UIComponents.Checkbox.getState($('#inputRunOnAdminDBToFetchUsers'));
    Communicator.call({
      methodName: 'command',
      args: { command: { rolesInfo: 1, showBuiltinRoles: true }, runOnAdminDB },
      callback: (err, result) => {
        let data = {};
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else data = Helper.populateComboboxData(result.result.roles, 'role');

        UIComponents.Combobox.init({ selector: $('#cmbRolesForDBForInheritedRole'), data, options: { create_option: true, persistent_create_option: true, skip_no_results: true } });
        Notification.stop();
      }
    });
  },

  populatePrivilegesToSave() {
    const result = [];
    const privileges = $('#tblRolePrivileges').DataTable().rows().data();
    for (let i = 0; i < privileges.length; i += 1) {
      result.push({
        resource: this.getResourceObject(privileges[i].resource),
        actions: privileges[i].privilege,
      });
    }

    return result;
  },

  populateInheritRolesToSave() {
    const result = [];
    const rolesToInherit = $('#tblRolesToInherit').DataTable().rows().data();
    for (let i = 0; i < rolesToInherit.length; i += 1) {
      result.push({
        role: rolesToInherit[i].role,
        db: rolesToInherit[i].db,
      });
    }

    return result;
  },

  initRoles() {
    Notification.start('#btnCloseUMRoles');

    const command = {
      rolesInfo: 1,
      showBuiltinRoles: true,
    };

    const runOnAdminDB = UIComponents.Checkbox.getState($('#inputRunOnAdminDBToFetchUsers'));

    Communicator.call({
      methodName: 'command',
      args: { command, runOnAdminDB },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          UIComponents.DataTable.setupDatatable({
            selectorString: '#tblRoles',
            data: result.result.roles,
            columns: [
              { data: 'role', width: '35%' },
              { data: 'db', width: '35%' },
              { data: 'isBuiltin', width: '20%' },
            ],
            columnDefs: [
              getActionColumn({ actionType: 'VIEW', editClass: 'editor_edit', targetIndex: 3 }),
              getActionColumn({ deleteClass: 'editor_delete_role', targetIndex: 4 })
            ]
          });
        }
        Notification.stop();
      }
    });
  },

  deleteRole() {
    if (!SessionManager.get(SessionManager.strSessionUsermanagementRole)) return;

    const command = { dropRole: SessionManager.get(SessionManager.strSessionUsermanagementRole).role };
    UsermanagementHelper.proceedDroppingRoleOrUser('#btnCloseUMRoles', command, () => { this.initRoles(); });
  }
};

export default new UserManagementRoles();
