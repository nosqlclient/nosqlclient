/**
 * Created by sercan on 14.04.2016.
 */
Template.manageUsers.onRendered(function () {
    Template.manageUsers.initiateDatatable($('#tblUsers'), Template.strSessionUsermanagementUser);
    Template.manageUsers.initiateDatatable($('#tblUserRoles'), Template.strSessionUsermanagementRole);
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
    'click .editor_edit': function (e) {
        e.preventDefault();

        var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
        var runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
        var dbName = runOnAdminDB ? 'admin' : connection.databaseName;

        var userInfoCommand = {
            usersInfo: {user: Session.get(Template.strSessionUsermanagementUser).user, db: dbName},
            showCredentials: true,
            showPrivileges: true
        };

        Meteor.call('command', connection, userInfoCommand, false, false, runOnAdminDB, function (err, result) {
            if (err || result.error) {
                Template.showMeteorFuncError(err, result, "Couldn't fetch userInfo");
            }
            else {
                var user = result.result.users[0];
                console.log(user);
                var tblUserRoles = $('#tblUserRoles');
                // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
                if ($.fn.dataTable.isDataTable('#tblUserRoles')) {
                    tblUserRoles.DataTable().destroy();
                }
                tblUserRoles.DataTable({
                    data: user.roles,
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

                $('#editUserModal').modal('show');
            }
        });
    }
});

Template.manageUsers.initUsers = function () {
    // loading button
    var l = $('#btnSaveUsers').ladda();
    l.ladda('start');

    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var command = {
        usersInfo: 1,
        showCredentials: true
    };

    var runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

    Meteor.call('command', connection, command, false, false, runOnAdminDB, function (err, result) {
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
                    {data: "user", "width": "25%"},
                    {data: "roles[, ]", "width": "65%"}
                ],
                columnDefs: [
                    {
                        targets: [2],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Edit" class="editor_edit"><i class="fa fa-edit text-navy"></i></a>'
                    },
                    {
                        targets: [3],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Delete" class="editor_delete"><i class="fa fa-remove text-navy"></i></a>'
                    }
                ]
            });
        }
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

Template.manageUsers.initiateDatatable = function (selector, sessionKey) {
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
            Session.set(sessionKey, table.row(this).data());
        }
    });
};