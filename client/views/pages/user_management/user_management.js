/**
 * Created by RSercan on 9.4.2016.
 */
var defaultInformationText = 'Select a role or resource or privilege to see the details';
var loading = false;
var last_selected_node;
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
    },

    'click #btnManageUsers': function (e) {
        e.preventDefault();
        Template.manageUsers.initUsers();
    }
});

Template.userManagement.initUserTree = function () {
    Session.set(Template.strSessionUsermanagementInfo, '');
    Session.set(Template.strSessionSelectionUserManagement, defaultInformationText);
    $('#btnManageRole').hide();
    $('#btnManagePrivilege').hide();
    $('#btnManageUsers').hide();

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
                                rolesInfo: {role: node.data[0].text, db: dbName},
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
                    $('#btnManageRole').hide();
                    $('#btnManagePrivilege').hide();
                    $('#btnManageUsers').hide();

                    if (loading) {
                        tree.jstree(true).deselect_node(data.node);
                        return;
                    }

                    var node = data.instance.get_node(data.selected[0]);

                    if (node.text == Session.get(Template.strSessionSelectionUserManagement)) {
                        return;
                    }

                    // clear texts
                    Session.set(Template.strSessionUsermanagementInfo, '');
                    Session.set(Template.strSessionSelectionUserManagement, defaultInformationText);

                    Session.set(Template.strSessionSelectionUserManagement, Template.userManagement.getNodeInformation(node));
                }
            );
            Ladda.stopAll();
        }
    });
};

Template.userManagement.getNodeInformation = function (node) {
    if (!node.data || node.data[0].db || node.data[0].user) {
        if (node.data[0].user) {
            Session.set(Template.strSessionUsermanagementManageSelection, node.text);
            $('#btnManageRole').show();
        }
        else if (node.data[0].db) {
            Session.set(Template.strSessionUsermanagementManageSelection, node.text);
            $('#btnManageUsers').show();
        }

        return defaultInformationText;
    }

    if (node.data[0].role) {
        $('#btnManagePrivilege').show();

        Session.set(Template.strSessionUsermanagementManageSelection, node.data[0].text);
        Template.userManagement.getRoleInfo(node.data[0].text);
    }
    else if (node.data[0].privilege) {
        Template.userManagement.getResourceInfo(node.data[0].privilegeType);
    }
    else if (node.data[0].action) {
        Template.userManagement.getActionInfo(node.text);
    }

    return node.text;
};

Template.userManagement.getActionInfo = function (action) {
    var l = $('#btnRefreshUsers').ladda();
    l.ladda('start');
    loading = true;

    Meteor.call('getActionInfo', action, function (err, result) {
        if (err) {
            Session.set(Template.strSessionUsermanagementInfo, err.message);
        } else {
            Session.set(Template.strSessionUsermanagementInfo, result);
        }

        loading = false;
        Ladda.stopAll();
    });
};

Template.userManagement.getResourceInfo = function (resourceType) {
    var l = $('#btnRefreshUsers').ladda();
    l.ladda('start');
    loading = true;

    Meteor.call('getResourceInfo', resourceType, function (err, result) {
        if (err) {
            Session.set(Template.strSessionUsermanagementInfo, err.message);
        } else {
            Session.set(Template.strSessionUsermanagementInfo, result);
        }

        loading = false;
        Ladda.stopAll();
    });
};

Template.userManagement.getRoleInfo = function (role) {
    var l = $('#btnRefreshUsers').ladda();
    l.ladda('start');
    loading = true;

    Meteor.call('getRoleInfo', role, function (err, result) {
        if (err) {
            Session.set(Template.strSessionUsermanagementInfo, err.message);
        } else {
            Session.set(Template.strSessionUsermanagementInfo, result);
        }

        loading = false;
        Ladda.stopAll();
    });
};


Template.userManagement.populateTreeChildrenForPrivileges = function (role) {
    if (!role) {
        return [];
    }

    var result = [];
    result.push({
        'text': 'Privileges',
        'data': [{
            isBuiltin: role.isBuiltin
        }],
        'icon': 'fa fa-list-ul',
        'children': []
    });
    result.push({
        'text': 'Inherited Privileges',
        'data': [{
            isBuiltin: role.isBuiltin
        }],
        'icon': 'fa fa-list-ul',
        'children': []
    });

    if (role.privileges) {
        for (var i = 0; i < role.privileges.length; i++) {
            result[0].children.push({
                data: [
                    {
                        privilege: true,
                        privilegeType: Template.userManagement.getPrivilegeType(role.privileges[i].resource)
                    }
                ],
                text: Template.userManagement.getPrivilegeText(role.privileges[i].resource),
                icon: "fa fa-gears",
                children: Template.userManagement.getPrivilegeActions(role.privileges[i].actions)
            });
        }
    }

    if (role.inheritedPrivileges) {
        for (i = 0; i < role.inheritedPrivileges.length; i++) {
            result[1].children.push({
                data: [
                    {
                        privilege: true,
                        privilegeType: Template.userManagement.getPrivilegeType(role.inheritedPrivileges[i].resource)
                    }
                ],
                text: Template.userManagement.getPrivilegeText(role.inheritedPrivileges[i].resource),
                icon: "fa fa-gears",
                children: Template.userManagement.getPrivilegeActions(role.inheritedPrivileges[i].actions)
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

Template.userManagement.getPrivilegeType = function (resource) {
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
        return 'db+collection';
    }
    if (resource.db) {
        return 'db';
    }
    if (resource.collection) {
        return 'collection';
    }

    return "non-system"

};

Template.userManagement.getPrivilegeText = function (resource) {
    if (!resource) {
        return "";
    }

    var type = Template.userManagement.getPrivilegeType(resource);

    if (type == 'db+collection') {
        return resource.db + " " + resource.collection;
    }

    if (type == 'db') {
        return resource.db;
    }

    if (type == 'collection') {
        return resource.collection;
    }

    if (type == 'non-system') {
        return 'all non-system collections';
    }


    return type;
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
                        role: true,
                        text: user.roles[i].role
                    }
                ],
                text: user.roles[i].role + '@' + user.roles[i].db,
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
                        role: true,
                        text: user.inheritedRoles[i].role
                    }
                ],
                text: user.inheritedRoles[i].role + '@' + user.inheritedRoles[i].db,
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