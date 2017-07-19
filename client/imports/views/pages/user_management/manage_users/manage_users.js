import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import {Connections} from "/lib/imports/collections";
import "./manage_users.html";

const JSONEditor = require('jsoneditor');
const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by sercan on 14.04.2016.
 */
/*global swal*/


const populateTableData = function (users) {
    const result = [];
    for (let i = 0; i < users.length; i++) {
        const obj = {
            user: users[i].user,
            roles: []
        };

        for (let j = 0; j < users[i].roles.length; j++) {
            obj.roles.push('<b>' + users[i].roles[j].role + '</b>@' + users[i].roles[j].db);
        }

        result.push(obj);
    }

    return result;
};

const initiateRoleToAddTable = function () {
    const selector = $('#tblCurrentRoles');
    selector.find('tbody').on('click', 'tr', function () {
        const table = selector.DataTable();
        Helper.doTableRowSelectable(table, $(this));

        if (table.row(this).data()) {
            $('#inputAddRoleToUserRolename').val(table.row(this).data().role);
            $('#cmbDatabasesForAddRoleToUser').val(table.row(this).data().db).trigger('chosen:updated');
        }
    });

    Helper.attachDeleteTableRowEvent(selector);
};

const populateUserRolesToSave = function () {
    const result = [];
    const roles = $('#tblUserRoles').DataTable().rows().data();
    for (let i = 0; i < roles.length; i++) {
        result.push({
            db: roles[i].db,
            role: roles[i].role
        });
    }

    return result;
};

const populateUserRolesTable = function (roles, dataArray) {
    const tblUserRoles = $('#tblUserRoles');
    // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
    if ($.fn.dataTable.isDataTable('#tblUserRoles')) {
        tblUserRoles.DataTable().destroy();
    }
    tblUserRoles.DataTable({
        responsive: true,
        data: dataArray ? dataArray : roles,
        columns: [
            {data: "role", "width": "50%"},
            {data: "db", "width": "50%"}
        ],
        columnDefs: [
            {
                targets: [2],
                data: null,
                width: "5%",
                defaultContent: '<a href="" title="Delete" class="editor_delete"><i class="fa fa-remove text-navy"></i></a>'
            }
        ]
    });
};


export const popEditUserModal = function (user) {
    $('#addEditUserModalTitle').text('Edit User');

    Ladda.create(document.querySelector('#btnCloseUMDB')).start();

    const connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
    const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
    const dbName = runOnAdminDB ? 'admin' : connection.databaseName;
    const username = user ? user : Session.get(Helper.strSessionUsermanagementUser).user;

    const userInfoCommand = {
        usersInfo: {user: username, db: dbName},
        showCredentials: true,
        showPrivileges: true
    };

    Meteor.call('command', userInfoCommand, runOnAdminDB, {}, Meteor.default_connection._lastSessionId, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch userInfo");
        }
        else {
            $('#editUserModal').modal('show');

            const user = result.result.users[0];
            populateUserRolesTable(user.roles);

            const inputUsernameSelector = $('#inputUsernameUM');
            inputUsernameSelector.val(user.user);
            inputUsernameSelector.prop('disabled', true);

            const inputPasswordSelector = $('#inputPasswordUM');
            inputPasswordSelector.val('');
            inputPasswordSelector.attr('placeholder', 'Leave this blank to keep old one');

            if (user.customData) {
                $('.nav-tabs a[href="#tab-2"]').tab('show');
                Helper.setCodeMirrorValue($('#divCustomData'), JSON.stringify(user.customData, null, 1));
            }
        }

        Ladda.stopAll();
    });
};

export const initUsers = function () {
    // loading button

    Ladda.create(document.querySelector('#btnCloseUMDB')).start();

    const command = {
        usersInfo: 1,
        showCredentials: true
    };

    const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

    Meteor.call('command', command, runOnAdminDB, {}, Meteor.default_connection._lastSessionId, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch users");
        }
        else {
            const tblUsers = $('#tblUsers');
            // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
            if ($.fn.dataTable.isDataTable('#tblUsers')) {
                tblUsers.DataTable().destroy();
            }
            tblUsers.DataTable({
                responsive: true,
                data: populateTableData(result.result.users),
                columns: [
                    {data: "user", "width": "20%"},
                    {data: "roles[, ]", "width": "65%"}
                ],
                columnDefs: [
                    {
                        targets: [2],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Show File Info" class="editor_show_custom_data"><i class="fa fa-book text-navy"></i></a>'
                    },
                    {
                        targets: [3],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Edit" class="editor_edit"><i class="fa fa-edit text-navy"></i></a>'
                    },
                    {
                        targets: [4],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Delete" class="editor_delete_user"><i class="fa fa-remove text-navy"></i></a>'
                    }
                ]
            });
        }


        Ladda.stopAll();
    });
};

Template.manageUsers.onRendered(function () {
    Helper.initiateDatatable($('#tblUsers'), Helper.strSessionUsermanagementUser);
    Helper.initiateDatatable($('#tblUserRoles'));
    initiateRoleToAddTable();

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        const target = $(e.target).attr("href");
        if (target == '#tab-2') {
            Helper.initializeCodeMirror($('#divCustomData'), 'txtCustomData');
        }
    });
});

Template.manageUsers.helpers({
    getDB () {
        return Session.get(Helper.strSessionUsermanagementManageSelection);
    },

    getUser() {
        return Session.get(Helper.strSessionUsermanagementUser);
    }
});

Template.manageUsers.events({
    'click .editor_delete_user' (e) {
        e.preventDefault();

        if (!Session.get(Helper.strSessionUsermanagementUser)) {
            return;
        }

        swal({
            title: "Are you sure ?",
            text: "You can NOT recover this user afterwards, are you sure ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No"
        }, function (isConfirm) {
            if (isConfirm) {

                Ladda.create(document.querySelector('#btnCloseUMDB')).start();
                const command = {dropUser: Session.get(Helper.strSessionUsermanagementUser).user};
                const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

                Meteor.call('command', command, runOnAdminDB, {}, Meteor.default_connection._lastSessionId, function (err, result) {
                    if (err || result.error) {
                        Helper.showMeteorFuncError(err, result, "Couldn't drop user");
                    }
                    else {
                        initUsers();
                        toastr.success('Successfuly dropped user !');
                    }
                });
            }
        });

    },

    'click .editor_show_custom_data' (e) {
        e.preventDefault();

        Ladda.create(document.querySelector('#btnCloseUMDB')).start();

        const selectedUser = Session.get(Helper.strSessionUsermanagementUser);
        if (selectedUser) {
            const editorDiv = $('#jsonEditorOfCustomData');
            let jsonEditor = editorDiv.data('jsoneditor');
            if (!jsonEditor) {
                jsonEditor = new JSONEditor(document.getElementById('jsonEditorOfCustomData'), {
                    mode: 'tree',
                    modes: ['code', 'form', 'text', 'tree', 'view'],
                    search: true
                });

                editorDiv.data('jsoneditor', jsonEditor);
            }

            const connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
            const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
            const dbName = runOnAdminDB ? 'admin' : connection.databaseName;

            const userInfoCommand = {
                usersInfo: {user: selectedUser.user, db: dbName},
                showCredentials: true,
                showPrivileges: true
            };

            Meteor.call('command', userInfoCommand, runOnAdminDB, {}, Meteor.default_connection._lastSessionId, function (err, result) {
                if (err || result.error) {
                    Helper.showMeteorFuncError(err, result, "Couldn't fetch userInfo");
                }
                else {
                    const user = result.result.users[0];
                    jsonEditor.set(user.customData);
                    $('#customDataModal').modal('show');
                }

                Ladda.stopAll();
            });
        }
    },

    'click #btnApplyAddEditUser'  (e) {
        e.preventDefault();

        const usernameSelector = $('#inputUsernameUM');
        const passwordSelector = $('#inputPasswordUM');
        const titleSelector = $('#addEditUserModalTitle');

        if (!usernameSelector.val()) {
            toastr.warning('Username is required !');
            return;
        }

        if (!passwordSelector.val() && titleSelector.text() == 'Add User') {
            toastr.warning('Password is required !');
            return;
        }

        let customData = Helper.getCodeMirrorValue($('#divCustomData'));
        if (customData) {
            customData = Helper.convertAndCheckJSON(customData);

            if (customData["ERROR"]) {
                toastr.error("Syntax Error on customData: " + customData["ERROR"]);
                return;
            }
        }

        const command = {};
        if (titleSelector.text() == 'Edit User') {
            command.updateUser = usernameSelector.val();
        } else {
            command.createUser = usernameSelector.val();
        }

        command.roles = populateUserRolesToSave();

        if (customData) {
            command.customData = customData;
        }

        if (passwordSelector.val()) {
            command.pwd = passwordSelector.val();
        }


        Ladda.create(document.querySelector('#btnApplyAddEditUser')).start();
        const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

        Meteor.call('command', command, runOnAdminDB, {}, Meteor.default_connection._lastSessionId, function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't update user");
            }
            else {
                initUsers();
                if (titleSelector.text() == 'Edit User') {
                    toastr.success('Successfuly updated user !');
                }
                else {
                    toastr.success('Successfuly added user !');
                }
                $('#editUserModal').modal('hide');
            }

            Ladda.stopAll();
        });
    },

    'click #btnApplyAddRoleToUser' (e) {
        e.preventDefault();

        let db = $('#cmbDatabasesForAddRoleToUser').chosen().val();
        let roleName = $('#inputAddRoleToUserRolename').val();
        if (!db) {
            toastr.error('Database is required');
            return;
        }
        if (!roleName) {
            toastr.error('Role is required');
            return;
        }

        const tableSelector = $('#tblUserRoles').DataTable();
        const currentDatas = tableSelector.rows().data();
        for (let i = 0; i < currentDatas.length; i++) {
            if (currentDatas[i].db == db && currentDatas[i].role == roleName) {
                toastr.error('<b>' + roleName + '</b>@' + db + ' already exists !');
                return;
            }
        }

        const objectToAdd = {db: db, role: roleName};
        if (tableSelector.rows().data().length == 0) {
            populateUserRolesTable(null, [objectToAdd]);
        }
        else {
            tableSelector.row.add(objectToAdd).draw();
        }

        toastr.success('<b>' + roleName + '</b>@' + db + ' successfuly added');
    },

    'click #btnAddNewRoleToUser' (e) {
        e.preventDefault();
        const cmb = $('#cmbDatabasesForAddRoleToUser');
        cmb.append($("<optgroup id='optGroupDatabases' label='Databases'></optgroup>"));
        const cmbOptGroupCollection = cmb.find('#optGroupDatabases');

        Meteor.call('getDatabases', Meteor.default_connection._lastSessionId, function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't fetch databases");
            }
            else {
                for (let i = 0; i < result.result.length; i++) {
                    cmbOptGroupCollection.append($("<option></option>")
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
        });

        const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
        Meteor.call('command', {
            rolesInfo: 1,
            showBuiltinRoles: true
        }, runOnAdminDB, {}, Meteor.default_connection._lastSessionId, function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't fetch roles to populate table");
            }
            else {
                const tblCurrentRoles = $('#tblCurrentRoles');
                // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
                if ($.fn.dataTable.isDataTable('#tblCurrentRoles')) {
                    tblCurrentRoles.DataTable().destroy();
                }
                tblCurrentRoles.DataTable({
                    responsive: true,
                    data: result.result.roles,
                    columns: [
                        {data: "role", "width": "35%"},
                        {data: "db", "width": "45%"},
                        {data: "isBuiltin", "width": "20%"}
                    ]
                });

            }
        });
    },

    'click #btnAddNewUser'  (e) {
        e.preventDefault();

        const inputUsernameSelector = $('#inputUsernameUM');
        const inputPasswordSelector = $('#inputPasswordUM');
        $('#tblUserRoles').DataTable().clear().draw();
        inputUsernameSelector.val('');
        inputUsernameSelector.prop('disabled', false);
        inputPasswordSelector.val('');
        inputPasswordSelector.attr('placeholder', 'Password');

        $('#addEditUserModalTitle').text('Add User');
        $('.nav-tabs a[href="#tab-1"]').tab('show');
        Helper.setCodeMirrorValue($('#divCustomData'), '');
    },

    'click .editor_edit'  (e) {
        e.preventDefault();

        popEditUserModal();
    }
});