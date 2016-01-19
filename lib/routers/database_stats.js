/**
 * Created by RSercan on 19.1.2016.
 */
Router.route('/databaseStats', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});