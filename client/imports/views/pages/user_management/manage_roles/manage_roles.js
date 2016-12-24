/**
 * Created by sercan on 14.04.2016.
 */
import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {Connections} from '/lib/imports/collections/connections';

import './manage_roles.html';

const toastr = require('toastr');
const Ladda = require('ladda');

const popEditRoleModal = function (role) {
    $('#addEditRoleModalTitle').text('Edit Role');

    const l = Ladda.create(document.querySelector('#btnCloseUMRoles'));
    l.start();

    const connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
    const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
    const dbName = runOnAdminDB ? 'admin' : connection.databaseName;
    const roleName = role ? role : Session.get(Helper.strSessionUsermanagementRole).role;

    const rolesInfoCommand = {
        rolesInfo: {role: roleName, db: dbName},
        showPrivileges: true
    };

    Meteor.call('command', rolesInfoCommand, runOnAdminDB, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch roleInfo");
        }
        else {
            const role = result.result.roles[0];
            populateRolePrivilegesTable(role);
            populateRolesToInheritTable(role);

            const inputRoleNameSelector = $('#inputRoleUM');
            inputRoleNameSelector.val(role.role);
            inputRoleNameSelector.prop('disabled', true);


            $('#editRoleModal').modal('show');
        }

        Ladda.stopAll();
    });
};

const populateRolesToInheritTable = function (role, dataArray) {
    const tblRolesToInherit = $('#tblRolesToInherit');
    // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
    if ($.fn.dataTable.isDataTable('#tblRolesToInherit')) {
        tblRolesToInherit.DataTable().destroy();
    }
    tblRolesToInherit.DataTable({
        data: dataArray ? dataArray : role.inheritedRoles,
        columns: [
            {data: "role", "width": "50%"},
            {data: "db", "width": "45%"}
        ],
        columnDefs: [
            {
                targets: [2],
                data: null,
                width: "5%",
                render: function () {
                    if (role && role.isBuiltin) {
                        return '<a href="" title="Not Allowed"><i class="fa fa-ban text-navy"></i></a>';
                    }
                    return '<a href="" title="Delete" class="editor_delete"><i class="fa fa-remove text-navy"></i></a>';
                }
            }
        ]
    });
};

const populateRolePrivilegesTable = function (role, dataArray) {
    const tblRolePrivileges = $('#tblRolePrivileges');
    // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
    if ($.fn.dataTable.isDataTable('#tblRolePrivileges')) {
        tblRolePrivileges.DataTable().destroy();
    }

    tblRolePrivileges.DataTable({
        data: dataArray ? dataArray : populateTableDataForRole(role),
        columns: [
            {data: "privilege[, ]", "width": "50%"},
            {data: "resource", "width": "40%"}
        ],
        columnDefs: [
            {
                targets: [2],
                data: null,
                width: "5%",
                render: function () {
                    if (role && role.isBuiltin) {
                        return '<a href="" title="Not Allowed"><i class="fa fa-ban text-navy"></i></a>';
                    }

                    return '<a href="" title="Edit" class="editor_edit_privilege"><i class="fa fa-edit text-navy"></i></a>';
                }
            },
            {
                targets: [3],
                data: null,
                width: "5%",
                render: function () {
                    if (role && role.isBuiltin) {
                        return '<a href="" title="Not Allowed"><i class="fa fa-ban text-navy"></i></a>';
                    }
                    return '<a href="" title="Delete" class="editor_delete"><i class="fa fa-remove text-navy"></i></a>';
                }
            }
        ]
    });
};

const populateTableDataForRole = function (role) {
    const result = [];
    if (role.privileges) {
        for (let i = 0; i < role.privileges.length; i++) {
            result.push({
                privilege: role.privileges[i].actions,
                resource: getResource(role.privileges[i].resource)
            });
        }
    }

    return result;
};

const getResource = function (resource) {
    if (!resource) {
        return "";
    }

    if (resource.anyResource) {
        return "anyResource";
    }

    if (resource.cluster) {
        return "cluster";
    }

    if (resource.db && resource.collection) {
        return '<b>' + resource.collection + '</b>@' + resource.db;
    }
    if (resource.db) {
        return resource.db;
    }
    if (resource.collection) {
        return '<b>' + resource.collection + '</b>';
    }

    return "";
};

const getResourceObject = function (resourceString) {
    if (resourceString != 'anyResource' && resourceString != 'cluster') {
        const result = {};

        if (resourceString.indexOf('@') != -1) {
            result.db = resourceString.substr(resourceString.indexOf('@') + 1);
            result.collection = resourceString.substr(0, resourceString.indexOf('@')).replace('<b>', '').replace('</b>', '');
        }
        else if (resourceString.indexOf('<b>') != -1) {
            result.collection = resourceString.replace('<b>', '').replace('</b>', '');
            result.db = '';
        }
        else {
            result.db = resourceString;
            result.collection = '';
        }

        return result;
    }
    else if (resourceString == 'anyResource') {
        return {anyResource: true};
    }
    else if (resourceString == 'cluster') {
        return {cluster: true};
    }
    else {
        return {db: resourceString};
    }
};

const initResourcesForPrivileges = function (dbToSelect, collectionToSelect) {
    const cmb = $('#cmbPrivilegeResource');
    cmb.empty();
    cmb.prepend("<option value=''></option>");

    cmb.append($("<optgroup id='optCluster' label='Cluster'></optgroup>"));

    cmb.find('#optCluster').append($("<option></option>")
        .attr("value", 'cluster')
        .text('cluster'));

    cmb.append($("<optgroup id='optAnyResource' label='Any Resource'></optgroup>"));

    cmb.find('#optAnyResource').append($("<option></option>")
        .attr("value", 'anyResource')
        .text('anyResource'));

    cmb.append($("<optgroup id='optDB' label='Databases'></optgroup>"));

    const cmbDBGroup = cmb.find('#optDB');

    Meteor.call('getDatabases', function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch databases");
        }
        else {
            for (let i = 0; i < result.result.length; i++) {
                cmbDBGroup.append($("<option></option>")
                    .attr("value", result.result[i].name)
                    .text(result.result[i].name));
            }
        }

        cmb.chosen({
            create_option: true,
            allow_single_deselect: true,
            persistent_create_option: true,
            skip_no_results: true
        });

        if (dbToSelect) {
            if (dbToSelect != 'anyResource' && dbToSelect != 'cluster' &&
                cmbDBGroup.find("option[value = " + dbToSelect + "]").length == 0) {

                cmbDBGroup.append($("<option></option>")
                    .attr("value", dbToSelect)
                    .text(dbToSelect));
            }

            cmb.val(dbToSelect);
        }
        cmb.trigger("chosen:updated");

        // empty combobox first.
        initCollectionsForPrivilege(collectionToSelect);
    });
};

const initCollectionsForPrivilege = function (collectionToSelect, db, stopLadda) {
    const cmb = $('#cmbPrivilegeCollection');
    cmb.empty();
    cmb.prepend("<option value=''></option>");

    cmb.append($("<optgroup id='optCollections' label='Collections'></optgroup>"));
    const cmbGroup = cmb.find('#optCollections');

    if (db) {
        Meteor.call('listCollectionNames', db, function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't fetch collection names");
            }
            else {
                for (let i = 0; i < result.result.length; i++) {
                    cmbGroup.append($("<option></option>")
                        .attr("value", result.result[i].name)
                        .text(result.result[i].name));
                }
            }

            cmb.chosen({
                create_option: true,
                allow_single_deselect: true,
                persistent_create_option: true,
                skip_no_results: true
            });

            if (collectionToSelect) {
                if (cmbGroup.find("option[value = " + collectionToSelect + "]").length == 0) {
                    cmbGroup.append($("<option></option>")
                        .attr("value", collectionToSelect)
                        .text(collectionToSelect));
                }
                cmb.val(collectionToSelect);
            }
            cmb.trigger("chosen:updated");

            if (stopLadda) {
                Ladda.stopAll();
            }
        });
    } else {
        cmb.chosen({
            create_option: true,
            allow_single_deselect: true,
            persistent_create_option: true,
            skip_no_results: true
        });

        if (collectionToSelect) {
            if (cmbGroup.find("option[value = " + collectionToSelect + "]").length == 0) {
                cmbGroup.append($("<option></option>")
                    .attr("value", collectionToSelect)
                    .text(collectionToSelect));
            }

            cmb.val(collectionToSelect);
        }
        cmb.trigger("chosen:updated");

        if (stopLadda) {
            Ladda.stopAll();
        }
    }
};

const initActionsForPrivilege = function (actions) {
    const cmb = $('#cmbActionsOfPrivilege');
    cmb.empty();

    Meteor.call('getAllActions', Session.get(Helper.strSessionConnection), function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch actions from docs.mongodb.org");
        }
        else {
            for (let i = 0; i < result.length; i++) {
                cmb.append($("<option></option>")
                    .attr("value", result[i])
                    .text(result[i]));
            }
        }

        cmb.chosen({
            create_option: true,
            persistent_create_option: true,
            skip_no_results: true
        });

        if (actions) {
            for (let j = 0; j < actions.length; j++) {
                if (cmb.find("option[value = " + actions[j] + "]").length == 0) {
                    cmb.append($("<option></option>")
                        .attr("value", actions[j])
                        .text(actions[j]));
                }
            }
            cmb.val(actions);
        }

        cmb.trigger("chosen:updated");
        Ladda.stopAll();
    });
};

const initDatabasesForInheritRole = function () {
    const cmb = $('#cmbDatabasesForInheritRole');
    cmb.empty();

    Meteor.call('getDatabases', function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch databases");
        }
        else {
            for (let i = 0; i < result.result.length; i++) {
                cmb.append($("<option></option>")
                    .attr("value", result.result[i].name)
                    .text(result.result[i].name));
            }
        }

        cmb.chosen({
            create_option: true,
            persistent_create_option: true,
            skip_no_results: true
        });

        cmb.trigger("chosen:updated");
        initRolesForDBForInheritRole();
    });

};

const initRolesForDBForInheritRole = function () {
    const cmb = $('#cmbRolesForDBForInheritedRole');
    cmb.empty();
    cmb.prepend("<option value=''></option>");

    const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
    Meteor.call('command', {
        rolesInfo: 1,
        showBuiltinRoles: true
    }, false, false, runOnAdminDB, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch roles, please enter one manually");
        }
        else {
            for (let i = 0; i < result.result.roles.length; i++) {
                cmb.append($("<option></option>")
                    .attr("value", result.result.roles[i].role)
                    .text(result.result.roles[i].role));
            }
        }

        cmb.chosen({
            create_option: true,
            persistent_create_option: true,
            skip_no_results: true
        });

        cmb.trigger("chosen:updated");
        Ladda.stopAll();
    });
};

const populatePrivilegesToSave = function () {
    const result = [];
    const privileges = $('#tblRolePrivileges').DataTable().rows().data();
    for (let i = 0; i < privileges.length; i++) {
        result.push({
            resource: getResourceObject(privileges[i].resource),
            actions: privileges[i].privilege
        });
    }

    return result;
};

const populateInheritRolesToSave = function () {
    const result = [];
    const rolesToInherit = $('#tblRolesToInherit').DataTable().rows().data();
    for (let i = 0; i < rolesToInherit.length; i++) {
        result.push({
            role: rolesToInherit[i].role,
            db: rolesToInherit[i].db
        });
    }

    return result;
};

export const initRoles = function () {
    // loading button

    const l = Ladda.create(document.querySelector('#btnCloseUMRoles'));
    l.start();

    const command = {
        rolesInfo: 1,
        showBuiltinRoles: true
    };

    const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

    Meteor.call('command', command, runOnAdminDB, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch roles");
        }
        else {
            const tblRoles = $('#tblRoles');
            // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
            if ($.fn.dataTable.isDataTable('#tblRoles')) {
                tblRoles.DataTable().destroy();
            }
            tblRoles.DataTable({
                data: result.result.roles,
                columns: [
                    {data: "role", "width": "35%"},
                    {data: "db", "width": "35%"},
                    {data: "isBuiltin", "width": "20%"}
                ],
                columnDefs: [
                    {
                        targets: [3],
                        data: null,
                        width: "5%",
                        render: function (data, type, full) {
                            if (!full.isBuiltin) {
                                return '<a href="" title="Edit" class="editor_edit"><i class="fa fa-edit text-navy"></i></a>';
                            }
                            return '<a href="" title="View" class="editor_edit"><i class="fa fa-eye text-navy"></i></a>';
                        }
                    },
                    {
                        targets: [4],
                        data: null,
                        width: "5%",
                        render: function (data, type, full) {
                            if (!full.isBuiltin) {
                                return '<a href="" title="Delete" class="editor_delete_role"><i class="fa fa-remove text-navy"></i></a>'
                            }
                            return '<a href="" title="Not Allowed"><i class="fa fa-ban text-navy"></i></a>';
                        }
                    }
                ]
            });
        }


        Ladda.stopAll();
    });
};


Template.manageRoles.onRendered(function () {
    Helper.initiateDatatable($('#tblRoles'), Helper.strSessionUsermanagementRole);
    Helper.initiateDatatable($('#tblRolePrivileges'), Helper.strSessionUsermanagementPrivilege);
    Helper.initiateDatatable($('#tblRolesToInherit'));
});

Template.manageRoles.helpers({
    getDB () {
        return Session.get(Helper.strSessionUsermanagementManageSelection);
    },

    getRole () {
        return Session.get(Helper.strSessionUsermanagementRole);
    }
});

Template.manageRoles.events({
    'click .editor_delete_role' (e) {
        e.preventDefault();

        if (!Session.get(Helper.strSessionUsermanagementRole)) {
            return;
        }
        swal({
            title: "Are you sure ?",
            text: "You can NOT recover this role afterwards, are you sure ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No"
        }, function (isConfirm) {
            if (isConfirm) {

                const l = Ladda.create(document.querySelector('#btnCloseUMRoles'));
                l.start();

                const command = {dropRole: Session.get(Helper.strSessionUsermanagementRole).role};

                const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

                Meteor.call('command', command, runOnAdminDB, function (err, result) {
                    if (err || result.error) {
                        Helper.showMeteorFuncError(err, result, "Couldn't drop role");
                    }
                    else {
                        initRoles();
                        toastr.success('Successfuly dropped role !');
                    }
                });
            }
        });
    },

    'click .editor_edit' (e) {
        e.preventDefault();
        popEditRoleModal();
    },

    'click .editor_edit_privilege'(e) {
        e.preventDefault();

        if (!Session.get(Helper.strSessionUsermanagementPrivilege)) {
            return;
        }

        $('#addEditPrivilegeModalTitle').text('Edit Privilege');
        $('#addEditPrivilegeModalText').text('');


        const l = Ladda.create(document.querySelector('#btnApplyAddPrivilegeToRole'));
        l.start();

        const selectedResource = Session.get(Helper.strSessionUsermanagementPrivilege).resource;
        let dbToSelect = '', collectionToSelect = '';
        if (selectedResource && selectedResource != 'anyResource' && selectedResource != 'cluster') {
            if (selectedResource.indexOf('@') != -1) {
                dbToSelect = selectedResource.substr(selectedResource.indexOf('@') + 1);
                collectionToSelect = selectedResource.substr(0, selectedResource.indexOf('@')).replace('<b>', '').replace('</b>', '');
            }
            else if (selectedResource.indexOf('<b>') != -1) {
                collectionToSelect = selectedResource.replace('<b>', '').replace('</b>', '');
            } else {
                dbToSelect = selectedResource;
            }
        }
        else {
            dbToSelect = selectedResource;
        }


        initResourcesForPrivileges(dbToSelect, collectionToSelect);
        initActionsForPrivilege(Session.get(Helper.strSessionUsermanagementPrivilege).privilege);

        $('#addPrivilegeToRoleModal').modal('show');
    },

    'click #btnAddNewPrivilegeToRole'  (e) {
        e.preventDefault();
        if (Session.get(Helper.strSessionUsermanagementRole) && Session.get(Helper.strSessionUsermanagementRole).isBuiltin && $('#addEditRoleModalTitle').text() == 'Edit Role') {
            toastr.warning('Cannot add new privileges to builtin roles !');
            return;
        }

        $('#addEditPrivilegeModalTitle').text('Add Privilege');
        $('#addEditPrivilegeModalText').text('Role ' + (Session.get(Helper.strSessionUsermanagementRole) ? Session.get(Helper.strSessionUsermanagementRole).role : ''));


        const l = Ladda.create(document.querySelector('#btnApplyAddPrivilegeToRole'));
        l.start();

        initResourcesForPrivileges();
        initActionsForPrivilege();

        $('#addPrivilegeToRoleModal').modal('show');
    },

    'click #btnAddNewInheritRoleToRole'  (e) {
        e.preventDefault();
        if (Session.get(Helper.strSessionUsermanagementRole) && Session.get(Helper.strSessionUsermanagementRole).isBuiltin && $('#addEditRoleModalTitle').text() == 'Edit Role') {
            toastr.warning('Cannot add inherit roles to builtin roles !');
            return;
        }


        const l = Ladda.create(document.querySelector('#btnAddInheritRole'));
        l.start();

        initDatabasesForInheritRole();
        $('#addRoleToInherit').modal('show');
    },

    'click #btnApplyAddEditRole' (e) {
        e.preventDefault();
        const titleSelector = $('#addEditRoleModalTitle');
        const roleNameSelector = $('#inputRoleUM');

        if (Session.get(Helper.strSessionUsermanagementRole) && Session.get(Helper.strSessionUsermanagementRole).isBuiltin && titleSelector.text() == 'Edit Role') {
            toastr.warning('Cannot change builtin roles !');
            return;
        }

        if ($('#tblRolePrivileges').DataTable().rows().data().length == 0) {
            toastr.warning('At least one privilege is required !');
            return;
        }

        if (!roleNameSelector.val()) {
            toastr.warning('Role name is required !');
            return;
        }

        const command = {};
        if (titleSelector.text() == 'Edit Role') {
            command.updateRole = roleNameSelector.val();
        } else {
            command.createRole = roleNameSelector.val();
        }

        command.privileges = populatePrivilegesToSave();
        command.roles = populateInheritRolesToSave();


        const l = Ladda.create(document.querySelector('#btnApplyAddEditRole'));
        l.start();

        const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

        Meteor.call('command', command, runOnAdminDB, function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't update role");
            }
            else {
                initRoles();
                if ($('#addEditRoleModalTitle').text() == 'Edit Role') {
                    toastr.success('Successfuly updated role !');
                }
                else {
                    toastr.success('Successfuly added role !');
                }
                $('#editRoleModal').modal('hide');
            }

            Ladda.stopAll();
        });
    },

    'click #btnAddNewRole' (e) {
        e.preventDefault();

        const inputRoleSelector = $('#inputRoleUM');
        inputRoleSelector.val('');
        inputRoleSelector.prop('disabled', false);

        $('#addEditRoleModalTitle').text('Add Role');
        $('#tblRolePrivileges').DataTable().clear().draw();
        $('#tblRolesToInherit').DataTable().clear().draw();
    },

    'change #cmbPrivilegeResource' () {
        const db = $('#cmbPrivilegeResource').find(":selected").text();
        if (db && db != 'anyResource' && db != 'cluster') {

            const l = Ladda.create(document.querySelector('#btnApplyAddPrivilegeToRole'));
            l.start();

            initCollectionsForPrivilege(null, db, true);
        } else {
            const cmb = $('#cmbPrivilegeCollection');
            cmb.empty();
            cmb.val('').trigger('chosen:updated');
        }
    },

    'click #btnApplyAddPrivilegeToRole'  (e) {
        e.preventDefault();

        const cmbPrivilegeSelector = $('#cmbPrivilegeResource');
        const cmbPrivilegeCollection = $('#cmbPrivilegeCollection');

        let actions = $('#cmbActionsOfPrivilege').val();
        let resource = cmbPrivilegeSelector.val() ? cmbPrivilegeSelector.val() : '';
        if (cmbPrivilegeCollection.val() && resource != 'anyResource' && resource != 'cluster') {
            if (resource) {
                resource = '<b>' + cmbPrivilegeCollection.val() + '</b>@' + resource;
            } else {
                resource = '<b>' + cmbPrivilegeCollection.val() + '</b>';
            }
        }

        if (!actions) {
            toastr.warning('At least one action is required !');
            return;
        }

        const privilegesTableSelector = $('#tblRolePrivileges').DataTable();
        if ($('#addEditPrivilegeModalTitle').text() == 'Edit Privilege') {
            // edit existing privilege of role
            const selectedRowData = Session.get(Helper.strSessionUsermanagementPrivilege);

            privilegesTableSelector.rows().every(function () {
                const privilegesData = this.data();
                if (_.isEqual(privilegesData.privilege, selectedRowData.privilege)
                    && privilegesData.resource == selectedRowData.resource) {

                    privilegesData.privilege = actions;
                    privilegesData.resource = resource;
                }

                this.invalidate();
            });

            privilegesTableSelector.draw();
        }
        else {
            const objectToAdd = {
                privilege: actions,
                resource: resource
            };

            if (privilegesTableSelector.rows().data().length == 0) {
                populateRolePrivilegesTable(null, [objectToAdd]);
            }
            else {
                privilegesTableSelector.row.add(objectToAdd).draw();
            }
        }

        $('#addPrivilegeToRoleModal').modal('hide');
    },

    'click #btnAddInheritRole'  (e) {
        e.preventDefault();

        let db = $('#cmbDatabasesForInheritRole').val();
        let role = $('#cmbRolesForDBForInheritedRole').val();

        if (!db) {
            toastr.warning('Database is required !');
            return;
        }
        if (!role) {
            toastr.warning('Role is required !');
            return;
        }

        const table = $('#tblRolesToInherit').DataTable();
        const currentDatas = table.rows().data();
        for (let i = 0; i < currentDatas.length; i++) {
            if (currentDatas[i].db == db && currentDatas[i].role == role) {
                toastr.error('<b>' + role + '</b>@' + db + ' already exists !');
                return;
            }
        }

        const objectToAdd = {role: role, db: db};
        if (table.rows().data().length == 0) {
            populateRolesToInheritTable(null, [objectToAdd]);
        }
        else {
            table.row.add(objectToAdd).draw();
        }

        toastr.success('<b>' + role + '</b>@' + db + ' successfuly added');
    }

});