/**
 * Created by RSercan on 9.4.2016.
 */
Template.userManagement.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    var l = $('#btnRefreshUsers').ladda();
    l.ladda('start');

    var chckRunOnAdminDB = $('#aRunOnAdminDBToFetchUsers');
    chckRunOnAdminDB.iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    chckRunOnAdminDB.iCheck('uncheck');

    Template.userManagement.initUserTree();
});

Template.userManagement.events({
    'click #btnRefreshUsers': function (e) {
        e.preventDefault();

        var l = $('#btnRefreshUsers').ladda();
        l.ladda('start');

        $("#userTree").jstree('destroy');
        Template.userManagement.initUserTree();
    }
});

Template.userManagement.initUserTree = function () {
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var command = {
        usersInfo: 1,
        showCredentials: true
    };

    var runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

    Meteor.call('command', connection, command, false, false, runOnAdminDB, function (err, result) {
        if (err || result.error) {
            var errorMessage;
            if (err) {
                errorMessage = err.message;
            } else {
                errorMessage = result.error.message;
            }
            if (errorMessage) {
                toastr.error("Couldn't fetch users: " + errorMessage);
            } else {
                toastr.error("Couldn't fetch users");
            }
            Ladda.stopAll();
        }
        else {
            var root = runOnAdminDB ? 'admin' : connection.databaseName;
            var children = Template.userManagement.populateTreeChildrenForUsers(result.result.users);
            var finalObject = {
                'core': {
                    'data': function (node, callback) {
                        if (node.id === "#") {
                            callback([
                                {
                                    'text': root,
                                    'icon': 'fa fa-database',
                                    'state': {
                                        'opened': true
                                    },
                                    'children': children
                                }
                            ]);
                        } else {
                            //TODO
                            callback([{'text': node.text}]);
                        }
                    }
                }
            };

            $('#userTree').jstree(finalObject);

            Ladda.stopAll();
        }
    });
};


Template.userManagement.populateTreeChildrenForUsers = function (users) {
    var result = [];
    for (var i = 0; i < users.length; i++) {
        result.push({
            id: users[i]._id,
            text: users[i].user,
            icon: "fa fa-user",
            children: true
        })
    }

    return result;
};