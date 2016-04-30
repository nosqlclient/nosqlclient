/**
 * Created by sercan on 14.04.2016.
 */
Template.manageUsers.onRendered(function () {
    Template.initiateDatatable($('#tblUsers'), Template.strSessionUsermanagementUser);
    Template.initiateDatatable($('#tblUserRoles'));
    Template.manageUsers.initiateRoleToAddTable();
});

Template.manageUsers.helpers({
    'getDB': function () {
        return Session.get(Template.strSessionUsermanagementManageSelection);
    },

    'getUser': function () {
        return Session.get(Template.strSessionUsermanagementUser);
    }
});

Template.manageUsers.events({
    'click .editor_delete_user': function (e) {
        e.preventDefault();

        if (!Session.get(Template.strSessionUsermanagementUser)) {
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
                var l = $('#btnCloseUMDB').ladda();
                l.ladda('start');

                var command = {dropUser: Session.get(Template.strSessionUsermanagementUser).user};

                var runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

                Meteor.call('command', Session.get(Template.strSessionConnection), command, false, false, runOnAdminDB, function (err, result) {
                    if (err || result.error) {
                        Template.showMeteorFuncError(err, result, "Couldn't drop user");
                    }
                    else {
                        Template.manageUsers.initUsers();
                        toastr.success('Successfuly dropped user !');
                    }
                });
            }
        });

    },

    'click .editor_show_custom_data': function (e) {
        e.preventDefault();
        var l = $('#btnCloseUMDB').ladda();
        l.ladda('start');

        var selectedUser = Session.get(Template.strSessionUsermanagementUser);
        if (selectedUser) {
            var editorDiv = $('#jsonEditorOfCustomData');
            var jsonEditor = editorDiv.data('jsoneditor');
            if (!jsonEditor) {
                jsonEditor = new JSONEditor(document.getElementById('jsonEditorOfCustomData'), {
                    mode: 'tree',
                    modes: ['code', 'form', 'text', 'tree', 'view'],
                    search: true
                });

                editorDiv.data('jsoneditor', jsonEditor);
            }

            var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
            var runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
            var dbName = runOnAdminDB ? 'admin' : connection.databaseName;

            var userInfoCommand = {
                usersInfo: {user: selectedUser.user, db: dbName},
                showCredentials: true,
                showPrivileges: true
            };

            Meteor.call('command', connection._id, userInfoCommand, false, false, runOnAdminDB, function (err, result) {
                if (err || result.error) {
                    Template.showMeteorFuncError(err, result, "Couldn't fetch userInfo");
                }
                else {
                    var user = result.result.users[0];
                    jsonEditor.set(user.customData);
                    $('#customDataModal').modal('show');
                }

                Ladda.stopAll();
            });
        }
    },

    'click #btnApplyAddEditUser': function (e) {
        e.preventDefault();

        var usernameSelector = $('#inputUsernameUM');
        var passwordSelector = $('#inputPasswordUM');
        var titleSelector = $('#addEditUserModalTitle');

        if (!usernameSelector.val()) {
            toastr.warning('Username is required !');
            return;
        }

        if (!passwordSelector.val() && titleSelector.text() == 'Add User') {
            toastr.warning('Password is required !');
            return;
        }

        var customData = ace.edit("aceCustomDataUM").getSession().getValue();
        if (customData) {
            try {
                customData = JSON.parse(customData);
            }
            catch (err) {
                toastr.error("Syntax Error on customData: " + err.message);
                return;
            }
        }

        var command = {};
        if (titleSelector.text() == 'Edit User') {
            command.updateUser = usernameSelector.val();
        } else {
            command.createUser = usernameSelector.val();
        }

        command.roles = Template.manageUsers.populateUserRolesToSave();

        if (customData) {
            command.customData = customData;
        }

        if (passwordSelector.val()) {
            command.pwd = passwordSelector.val();
        }

        var l = $('#btnApplyAddEditUser').ladda();
        l.ladda('start');

        var runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

        Meteor.call('command', Session.get(Template.strSessionConnection), command, false, false, runOnAdminDB, function (err, result) {
            if (err || result.error) {
                Template.showMeteorFuncError(err, result, "Couldn't update user");
            }
            else {
                Template.manageUsers.initUsers();
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

    'click #btnApplyAddRoleToUser': function (e) {
        e.preventDefault();

        var db = $('#cmbDatabasesForAddRoleToUser').chosen().val();
        var roleName = $('#inputAddRoleToUserRolename').val();
        if (!db) {
            toastr.error('Database is required');
            return;
        }
        if (!roleName) {
            toastr.error('Role is required');
            return;
        }

        var tableSelector = $('#tblUserRoles').DataTable();
        var currentDatas = tableSelector.rows().data();
        for (var i = 0; i < currentDatas.length; i++) {
            if (currentDatas[i].db == db && currentDatas[i].role == roleName) {
                toastr.error('<b>' + roleName + '</b>@' + db + ' already exists !');
                return;
            }
        }

        var objectToAdd = {db: db, role: roleName};
        if (tableSelector.rows().data().length == 0) {
            Template.manageUsers.populateUserRolesTable(null, [objectToAdd]);
        }
        else {
            tableSelector.row.add(objectToAdd).draw();
        }

        toastr.success('<b>' + roleName + '</b>@' + db + ' successfuly added');
    },

    'click #btnAddNewRoleToUser': function (e) {
        e.preventDefault();
        var cmb = $('#cmbDatabasesForAddRoleToUser');
        cmb.append($("<optgroup id='optGroupDatabases' label='Databases'></optgroup>"));
        var cmbOptGroupCollection = cmb.find('#optGroupDatabases');

        Meteor.call('getDatabases', Session.get(Template.strSessionConnection), function (err, result) {
            if (err || result.error) {
                Template.showMeteorFuncError(err, result, "Couldn't fetch databases");
            }
            else {
                for (var i = 0; i < result.result.length; i++) {
                    cmbOptGroupCollection.append($("<option></option>")
                        .attr("value", result.result[i].name)
                        .text(result.result[i].name));
                }

                cmb.chosen();
            }
        });

        var runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
        Meteor.call('command', Session.get(Template.strSessionConnection), {
            rolesInfo: 1,
            showBuiltinRoles: true
        }, false, false, runOnAdminDB, function (err, result) {
            if (err || result.error) {
                Template.showMeteorFuncError(err, result, "Couldn't fetch roles to populate table");
            }
            else {
                var tblCurrentRoles = $('#tblCurrentRoles');
                // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
                if ($.fn.dataTable.isDataTable('#tblCurrentRoles')) {
                    tblCurrentRoles.DataTable().destroy();
                }
                tblCurrentRoles.DataTable({
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

    'click #btnAddNewUser': function (e) {
        e.preventDefault();

        var inputUsernameSelector = $('#inputUsernameUM');
        var inputPasswordSelector = $('#inputPasswordUM');
        $('#tblUserRoles').DataTable().clear().draw();
        inputUsernameSelector.val('');
        inputUsernameSelector.prop('disabled', false);
        inputPasswordSelector.val('');
        inputPasswordSelector.attr('placeholder', 'Password');

        $('#addEditUserModalTitle').text('Add User');
        Template.manageUsers.loadCustomDataEditor();
        ace.edit("aceCustomDataUM").setValue('');
    },

    'click .editor_edit': function (e) {
        e.preventDefault();

        Template.manageUsers.popEditUserModal();
    }
});

Template.manageUsers.initUsers = function () {
    // loading button
    var l = $('#btnCloseUMDB').ladda();
    l.ladda('start');

    var command = {
        usersInfo: 1,
        showCredentials: true
    };

    var runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

    Meteor.call('command', Session.get(Template.strSessionConnection), command, false, false, runOnAdminDB, function (err, result) {
        if (err || result.error) {
            Template.showMeteorFuncError(err, result, "Couldn't fetch users");
        }
        else {
            var tblUsers = $('#tblUsers');
            // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
            if ($.fn.dataTable.isDataTable('#tblUsers')) {
                tblUsers.DataTable().destroy();
            }
            tblUsers.DataTable({
                data: Template.manageUsers.populateTableData(result.result.users),
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

Template.manageUsers.populateTableData = function (users) {
    var result = [];
    for (var i = 0; i < users.length; i++) {
        var obj = {
            user: users[i].user,
            roles: []
        };

        for (var j = 0; j < users[i].roles.length; j++) {
            obj.roles.push('<b>' + users[i].roles[j].role + '</b>@' + users[i].roles[j].db);
        }

        result.push(obj);
    }

    return result;
};

Template.manageUsers.initiateRoleToAddTable = function () {
    var selector = $('#tblCurrentRoles');
    selector.find('tbody').on('click', 'tr', function () {
        var table = selector.DataTable();
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }

        if (table.row(this).data()) {
            $('#inputAddRoleToUserRolename').val(table.row(this).data().role);
            $('#cmbDatabasesForAddRoleToUser').val(table.row(this).data().db).trigger('chosen:updated');
        }
    });

    selector.find('tbody').on('click', 'a.editor_delete', function () {
        selector.DataTable().row($(this).parents('tr')).remove().draw();
    });
};

Template.manageUsers.populateUserRolesToSave = function () {
    var result = [];
    var roles = $('#tblUserRoles').DataTable().rows().data();
    for (var i = 0; i < roles.length; i++) {
        result.push({
            db: roles[i].db,
            role: roles[i].role
        });
    }

    return result;
};

Template.manageUsers.loadCustomDataEditor = function () {
    Tracker.autorun(function (e) {
        var editor = AceEditor.instance('aceCustomDataUM', {
            mode: "javascript",
            theme: 'dawn'
        });
        if (editor.loaded !== undefined) {
            e.stop();
            editor.$blockScrolling = Infinity;
            editor.setOptions({
                fontSize: "11pt",
                showPrintMargin: false
            });
        }
    });
};

Template.manageUsers.popEditUserModal = function (user) {
    $('#addEditUserModalTitle').text('Edit User');
    var l = $('#btnCloseUMDB').ladda();
    l.ladda('start');

    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
    var dbName = runOnAdminDB ? 'admin' : connection.databaseName;
    var username = user ? user : Session.get(Template.strSessionUsermanagementUser).user;

    var userInfoCommand = {
        usersInfo: {user: username, db: dbName},
        showCredentials: true,
        showPrivileges: true
    };

    Meteor.call('command', connection._id, userInfoCommand, false, false, runOnAdminDB, function (err, result) {
        if (err || result.error) {
            Template.showMeteorFuncError(err, result, "Couldn't fetch userInfo");
        }
        else {
            var user = result.result.users[0];
            Template.manageUsers.populateUserRolesTable(user.roles);

            var inputUsernameSelector = $('#inputUsernameUM');
            inputUsernameSelector.val(user.user);
            inputUsernameSelector.prop('disabled', true);

            // set customData
            Template.manageUsers.loadCustomDataEditor();
            if (user.customData) {
                ace.edit("aceCustomDataUM").setValue(JSON.stringify(user.customData, null, '\t'), -1);
            }

            var inputPasswordSelector = $('#inputPasswordUM');
            inputPasswordSelector.val('');
            inputPasswordSelector.attr('placeholder', 'Leave this blank to keep old one');

            $('#editUserModal').modal('show');
        }

        Ladda.stopAll();
    });
};

Template.manageUsers.populateUserRolesTable = function (roles, dataArray) {
    var tblUserRoles = $('#tblUserRoles');
    // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
    if ($.fn.dataTable.isDataTable('#tblUserRoles')) {
        tblUserRoles.DataTable().destroy();
    }
    tblUserRoles.DataTable({
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