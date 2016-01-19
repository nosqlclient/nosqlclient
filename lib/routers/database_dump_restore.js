/**
 * Created by RSercan on 19.1.2016.
 */
Router.route('/databaseDumpRestore', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections'), Meteor.subscribe('dumps', Session.get(Template.strSessionConnection))];
    }
});