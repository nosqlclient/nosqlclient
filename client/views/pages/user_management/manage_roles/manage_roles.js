/**
 * Created by sercan on 14.04.2016.
 */
Template.manageRoles.helpers({
    'getUser': function () {
        return Session.get(Template.strSessionUsermanagementManageSelection);
    }
});