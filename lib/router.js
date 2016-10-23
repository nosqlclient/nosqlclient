/**
 * Created by RSercan on 26.12.2015.
 */

import {Meteor} from 'meteor/meteor';

Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound'
});

Router.route('/adminQueries', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});

Router.route('/aggregatePipeline', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});

Router.route('/browseCollection', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections'), Meteor.subscribe('queryHistories')];
    }
});

Router.route('/databaseDumpRestore', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections'), Meteor.subscribe('dumps', Session.get(Template.strSessionConnection))];
    }
});

Router.route('/databaseStats', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});

Router.route('/editDocument', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});

Router.route('/fileManagement', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});

Router.route('/healthcheck', function () {
    this.response.statusCode = 200;
    this.response.end("Server is up and running");
}, {where: "server"});

Router.route('/', {
    name: 'home',
    template: 'databaseStats',
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});

Router.route('/settings', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections')];
    }
});

Router.route('/userManagement', {
    waitOn: function () {
        return [Meteor.subscribe('settings'), Meteor.subscribe('connections'), Meteor.subscribe('actions')];
    }
});