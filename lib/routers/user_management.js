/**
 * Created by sercan on 16.02.2016.
 */
Router.route('/userManagement', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections'), Meteor.subscribe('actions')];
    }
});