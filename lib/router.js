/**
 * Created by RSercan on 26.12.2015.
 */

Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound'
});

Router.route('/adminQueries', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});

Router.route('/databaseDumpRestore', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections'), Meteor.subscribe('dumps', Session.get(Template.strSessionConnection))];
    }
});

Router.route('/settings', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});

Router.route('/databaseStats', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});

Router.route('/browseCollection', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});

Router.route('/', {
    name: 'home',
    template: 'databaseStats',
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});

//Router.route('/', {
//    template: 'default',
//    waitOn: function () {
//        return [Meteor.subscribe('connections')];
//    }
//});