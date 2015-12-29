/**
 * Created by RSercan on 26.12.2015.
 */
Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound'
});

Router.route('/browseDB', {
    waitOn: function () {
        return [Meteor.subscribe('connections')];
    }
});

Router.route('/browseCollection', {
    waitOn: function () {
        return [Meteor.subscribe('connections')];
    }
});

Router.route('/', {
    template: 'browseDB',
    waitOn: function () {
        return [Meteor.subscribe('connections')];
    }
});

//Router.route('/', {
//    template: 'default',
//    waitOn: function () {
//        return [Meteor.subscribe('connections')];
//    }
//});