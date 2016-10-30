import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {Connections} from '/lib/imports/collections/connections';
import {initUsers, popEditUserModal} from './manage_users/manage_users';
import {initRoles} from './manage_roles/manage_roles';

import './user_management.html';

var toastr = require('toastr');
var Ladda = require('ladda');
//var Clipboard = require('clipboard');
/**
 * Created by RSercan on 9.4.2016.
 */
const defaultInformationText = 'Select a role or resource or privilege to see the details';
let loading = false;

const initUserTree = function () {
    Session.set(Helper.strSessionUsermanagementInfo, '');
    Session.set(Helper.strSessionSelectionUserManagement, defaultInformationText);
    $('#btnEditUser').hide();
    $('#btnManageUsers').hide();
    $('#btnManageRoles').hide();


    var connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
    var command = {
        usersInfo: 1,
        showCredentials: true
    };

    var runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

    Meteor.call('command', command, runOnAdminDB, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch users");
        }
        else {
            var dbName = runOnAdminDB ? 'admin' : connection.databaseName;
            var children = populateTreeChildrenForUsers(result.result.users);
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

                            Meteor.call('command', userInfoCommand, runOnAdminDB, function (err, result) {
                                if (err || result.error) {
                                    Helper.showMeteorFuncError(err, result, "Couldn't fetch userInfo");
                                }
                                else {
                                    callback(populateTreeChildrenForRoles(result.result.users[0]));
                                }
                            });
                        }
                        else if (node.data[0].role) {
                            var roleInfoCommand = {
                                rolesInfo: {role: node.data[0].text, db: dbName},
                                showPrivileges: true,
                                showBuiltinRoles: true
                            };

                            Meteor.call('command', roleInfoCommand, runOnAdminDB, function (err, result) {
                                if (err || result.error) {
                                    Helper.showMeteorFuncError(err, result, "Couldn't fetch roleInfo");
                                }
                                else {
                                    callback(populateTreeChildrenForPrivileges(result.result.roles[0]));
                                }
                            });
                        }
                    }
                }
            };

            var tree = $('#userTree');
            tree.jstree(finalObject);

            tree.bind("select_node.jstree", function (evt, data) {
                    $('#btnEditUser').hide();
                    $('#btnManageUsers').hide();
                    $('#btnManageRoles').hide();

                    if (loading) {
                        tree.jstree(true).deselect_node(data.node);
                        return;
                    }

                    var node = data.instance.get_node(data.selected[0]);

                    if (node.text == Session.get(Helper.strSessionSelectionUserManagement)) {
                        return;
                    }

                    // clear texts
                    Session.set(Helper.strSessionUsermanagementInfo, '');
                    Session.set(Helper.strSessionSelectionUserManagement, defaultInformationText);

                    Session.set(Helper.strSessionSelectionUserManagement, getNodeInformation(node));
                }
            );
            Ladda.stopAll();
        }
    });
};

const getNodeInformation = function (node) {
    if (!node.data || node.data[0].db || node.data[0].user) {
        if (node.data[0].user) {
            Session.set(Helper.strSessionUsermanagementManageSelection, node.text);
            $('#btnEditUser').show();
        }
        else if (node.data[0].db) {
            Session.set(Helper.strSessionUsermanagementManageSelection, node.text);
            $('#btnManageUsers').show();
            $('#btnManageRoles').show();
        }

        return defaultInformationText;
    }

    if (node.data[0].role) {
        Session.set(Helper.strSessionUsermanagementManageSelection, node.data[0].text);
        getRoleInfo(node.data[0].text);
    }
    else if (node.data[0].privilege) {
        getResourceInfo(node.data[0].privilegeType);
    }
    else if (node.data[0].action) {
        getActionInfo(node.text);
    }

    return node.text;
};

const getActionInfo = function (action) {

    var l = Ladda.create(document.querySelector('#btnRefreshUsers'));
    l.start();
    loading = true;

    Meteor.call('getActionInfo', action, function (err, result) {
        if (err) {
            Session.set(Helper.strSessionUsermanagementInfo, err.message);
        } else {
            Session.set(Helper.strSessionUsermanagementInfo, result);
        }

        loading = false;

        Ladda.stopAll();
    });
};

const getResourceInfo = function (resourceType) {

    var l = Ladda.create(document.querySelector('#btnRefreshUsers'));
    l.start();
    loading = true;

    Meteor.call('getResourceInfo', resourceType, function (err, result) {
        if (err) {
            Session.set(Helper.strSessionUsermanagementInfo, err.message);
        } else {
            Session.set(Helper.strSessionUsermanagementInfo, result);
        }

        loading = false;

        Ladda.stopAll();
    });
};

const getRoleInfo = function (role) {

    var l = Ladda.create(document.querySelector('#btnRefreshUsers'));
    l.start();
    loading = true;

    Meteor.call('getRoleInfo', role, function (err, result) {
        if (err) {
            Session.set(Helper.strSessionUsermanagementInfo, err.message);
        } else {
            Session.set(Helper.strSessionUsermanagementInfo, result);
        }

        loading = false;
        Ladda.stopAll();
    });
};


const populateTreeChildrenForPrivileges = function (role) {
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
                        privilegeType: getPrivilegeType(role.privileges[i].resource)
                    }
                ],
                text: getPrivilegeText(role.privileges[i].resource),
                icon: "fa fa-gears",
                children: getPrivilegeActions(role.privileges[i].actions)
            });
        }
    }

    if (role.inheritedPrivileges) {
        for (i = 0; i < role.inheritedPrivileges.length; i++) {
            result[1].children.push({
                data: [
                    {
                        privilege: true,
                        privilegeType: getPrivilegeType(role.inheritedPrivileges[i].resource)
                    }
                ],
                text: getPrivilegeText(role.inheritedPrivileges[i].resource),
                icon: "fa fa-gears",
                children: getPrivilegeActions(role.inheritedPrivileges[i].actions)
            });
        }
    }

    return result;
};

const getPrivilegeActions = function (actions) {
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

const getPrivilegeType = function (resource) {
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

const getPrivilegeText = function (resource) {
    if (!resource) {
        return "";
    }

    var type = getPrivilegeType(resource);

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

const populateTreeChildrenForRoles = function (user) {
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

const populateTreeChildrenForUsers = function (users) {
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

Template.userManagement.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }


    var l = Ladda.create(document.querySelector('#btnRefreshUsers'));
    l.start();

    var chckRunOnAdminDB = $('#aRunOnAdminDBToFetchUsers');
    chckRunOnAdminDB.iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    chckRunOnAdminDB.iCheck('uncheck');

    initUserTree();
    //new Clipboard('.reference');
});

Template.userManagement.helpers({
    informationTitle () {
        return Session.get(Helper.strSessionSelectionUserManagement);
    },
    informationBody() {
        return Session.get(Helper.strSessionUsermanagementInfo);
    }
});

Template.userManagement.events({
    //'click a':  (e) {
    //   e.preventDefault();
    //   if (e.currentTarget && e.currentTarget.host && e.currentTarget.host.indexOf('docs.mongodb.org') != -1) {
    //       toastr.success('Link has been copied to clipboard !');
    //    }
    //},

    'click #btnRefreshUsers'(e) {
        e.preventDefault();


        var l = Ladda.create(document.querySelector('#btnRefreshUsers'));
        l.start();

        $("#userTree").jstree('destroy');
        initUserTree();
    },

    'click #btnManageUsers'  (e) {
        e.preventDefault();
        initUsers();
    },

    'click #btnManageRoles' (e) {
        e.preventDefault();
        initRoles();
    },

    'click #btnEditUser'  (e) {
        e.preventDefault();
        if (Session.get(Helper.strSessionUsermanagementManageSelection)) {
            popEditUserModal(Session.get(Helper.strSessionUsermanagementManageSelection));
        }
    }
});