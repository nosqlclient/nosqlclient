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
        Template.warnDemoApp();
    },

    'click .editor_show_custom_data': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    },

    'click #btnApplyAddEditUser': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    },

    'click #btnApplyAddRoleToUser': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    },

    'click #btnAddNewRoleToUser': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    },

    'click #btnAddNewUser': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    },

    'click .editor_edit': function (e) {
        e.preventDefault();
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