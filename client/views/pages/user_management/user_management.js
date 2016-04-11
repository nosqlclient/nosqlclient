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
    new Clipboard('.reference');
});

Template.userManagement.helpers({
    'informationTitle': function () {
        return Session.get(Template.strSessionSelectionUserManagement);
    },
    'informationBody': function () {
        return Session.get(Template.strSessionUsermanagementInfo);
    }
});

Template.userManagement.events({
    'click a': function (e) {
        e.preventDefault();
        if (e.currentTarget && e.currentTarget.host && e.currentTarget.host.indexOf('docs.mongodb.org') != -1) {
            toastr.success('Link has been copied to clipboard !');
        }
    },

    'click #btnRefreshUsers': function (e) {
        e.preventDefault();

        var l = $('#btnRefreshUsers').ladda();
        l.ladda('start');

        $("#userTree").jstree('destroy');
        Template.userManagement.initUserTree();
    }
});

Template.userManagement.initUserTree = function () {
    Session.set(Template.strSessionUsermanagementInfo, '');
    Session.set(Template.strSessionSelectionUserManagement, '');

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
            var dbName = runOnAdminDB ? 'admin' : connection.databaseName;
            var children = Template.userManagement.populateTreeChildrenForUsers(result.result.users);
            var finalObject = {
                'core': {
                    'data': function (node, callback) {
                        if (node.id === "#") {
                            callback([
                                {
                                    'text': dbName,
                                    'icon': 'fa fa-database',
                                    'data': [{'db': true}],
                                    'state': {
                                        'opened': true
                                    },
                                    'children': children
                                }
                            ]);
                        }
                        else if (node.data[0].user) {
                            var userInfoCommand = {
                                usersInfo: {user: node.text, db: dbName},
                                showCredentials: true,
                                showPrivileges: true
                            };

                            Meteor.call('command', connection, userInfoCommand, false, false, runOnAdminDB, function (err, result) {
                                if (err || result.error) {
                                    Template.showMeteorFuncError(err, result, "Couldn't fetch userInfo");
                                }
                                else {
                                    callback(Template.userManagement.populateTreeChildrenForRoles(result.result.users[0]));
                                }
                            });
                        }
                        else if (node.data[0].role) {
                            var roleInfoCommand = {
                                rolesInfo: {role: node.text, db: dbName},
                                showPrivileges: true,
                                showBuiltinRoles: true
                            };

                            Meteor.call('command', connection, roleInfoCommand, false, false, runOnAdminDB, function (err, result) {
                                if (err || result.error) {
                                    Template.showMeteorFuncError(err, result, "Couldn't fetch roleInfo");
                                }
                                else {
                                    callback(Template.userManagement.populateTreeChildrenForPrivileges(result.result.roles[0]));
                                }
                            });
                        }
                    }
                }
            };

            var tree = $('#userTree');
            tree.jstree(finalObject);
            tree.bind("select_node.jstree", function (evt, data) {
                    var node = data.instance.get_node(data.selected[0]);

                    if (node.text == Session.get(Template.strSessionSelectionUserManagement)) {
                        return;
                    }

                    // clear texts
                    Session.set(Template.strSessionUsermanagementInfo, '');
                    Session.set(Template.strSessionSelectionUserManagement, '');

                    Session.set(Template.strSessionSelectionUserManagement, Template.userManagement.getNodeInformation(node));
                }
            );
            Ladda.stopAll();
        }
    });
};

Template.userManagement.getNodeInformation = function (node) {
    if (!node.data) {
        return '';
    }

    if (node.data[0].role) {
        Template.userManagement.getRoleInfo(node.text);
    }
    else if (node.data[0].privilege) {
        Template.userManagement.getResourceInfo(node.text);
    }
    else if (node.data[0].action) {
        Template.userManagement.getActionInfo(node.text);
    }
    else {
        return '';
    }


    return node.text;
};

Template.userManagement.getActionInfo = function (action) {
//TODO
};

Template.userManagement.getResourceInfo = function (resource) {
//TODO
};

Template.userManagement.getRoleInfo = function (role) {
    var l = $('#btnRefreshUsers').ladda();
    l.ladda('start');

    Meteor.call('getRoleInfo', role, function (err, result) {
        if (err) {
            Session.set(Template.strSessionUsermanagementInfo, err.message);
        } else {
            Session.set(Template.strSessionUsermanagementInfo, result);
        }

        Ladda.stopAll();
    });
};


Template.userManagement.populateTreeChildrenForPrivileges = function (privilege) {
    if (!privilege) {
        return [];
    }

    var result = [];
    result.push({
        'text': 'Privileges',
        'icon': 'fa fa-list-ul',
        'children': []
    });
    result.push({
        'text': 'Inherited Privileges',
        'icon': 'fa fa-list-ul',
        'children': []
    });

    if (privilege.privileges) {
        for (var i = 0; i < privilege.privileges.length; i++) {
            result[0].children.push({
                data: [
                    {
                        privilege: true
                    }
                ],
                text: Template.userManagement.getPrivilegeText(privilege.privileges[i].resource),
                icon: "fa fa-gears",
                children: Template.userManagement.getPrivilegeActions(privilege.privileges[i].actions)
            });
        }
    }

    if (privilege.inheritedPrivileges) {
        for (i = 0; i < privilege.inheritedPrivileges.length; i++) {
            result[1].children.push({
                data: [
                    {
                        privilege: true
                    }
                ],
                text: Template.userManagement.getPrivilegeText(privilege.inheritedPrivileges[i].resource),
                icon: "fa fa-gears",
                children: Template.userManagement.getPrivilegeActions(privilege.inheritedPrivileges[i].actions)
            });
        }
    }

    return result;
};

Template.userManagement.getPrivilegeActions = function (actions) {
    if (!actions) {
        return [];
    }

    var result = [];
    for (var i = 0; i < actions.length; i++) {
        result.push({
            data: [
                {
                    action: true
                }
            ],
            text: actions[i],
            icon: "fa fa-bolt",
            children: false
        });
    }

    return result;
};

Template.userManagement.getPrivilegeText = function (resource) {
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
        return resource.db + " " + resource.collection;
    }
    if (resource.db) {
        return resource.db;
    }
    if (resource.collection) {
        return resource.collection;
    }

    return "";
};

Template.userManagement.populateTreeChildrenForRoles = function (user) {
    if (!user) {
        return [];
    }
    var result = [];
    result.push({
        'text': 'Roles',
        'icon': 'fa fa-list-alt',
        'children': []
    });
    result.push({
        'text': 'Inherited Roles',
        'icon': 'fa fa-list-alt',
        'children': []
    });

    if (user.roles) {
        for (var i = 0; i < user.roles.length; i++) {
            result[0].children.push({
                data: [
                    {
                        role: true
                    }
                ],
                text: user.roles[i].role,
                icon: "fa fa-bars",
                children: true
            });
        }
    }

    if (user.inheritedRoles) {
        for (i = 0; i < user.inheritedRoles.length; i++) {
            result[1].children.push({
                data: [
                    {
                        role: true
                    }
                ],
                text: user.inheritedRoles[i].role,
                icon: "fa fa-bars",
                children: true
            });
        }
    }
    return result;
};

Template.userManagement.populateTreeChildrenForUsers = function (users) {
    var result = [];
    for (var i = 0; i < users.length; i++) {
        result.push({
            id: users[i]._id,
            text: users[i].user,
            icon: "fa fa-user",
            data: [
                {
                    user: true
                }
            ],
            children: true
        })
    }

    return result;
};