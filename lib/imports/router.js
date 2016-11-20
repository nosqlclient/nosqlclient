/**
 * Created by RSercan on 26.12.2015.
 */

import {FlowRouter} from 'meteor/kadira:flow-router';

FlowRouter.notFound = {
    action() {
        BlazeLayout.render('mainLayout', {main: 'notFound'});
    }
};

FlowRouter.route('/', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "databaseStats"});
    }
});

FlowRouter.route('/shell', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "mcShell"});
    }
});

FlowRouter.route('/adminQueries', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "adminQueries"});
    }
});

FlowRouter.route('/aggregatePipeline', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "aggregatePipeline"});
    }
});

FlowRouter.route('/browseCollection', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "browseCollection"});
    }
});

FlowRouter.route('/databaseDumpRestore', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "databaseDumpRestore"});
    }
});

FlowRouter.route('/databaseStats', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "databaseStats"});
    }
});

FlowRouter.route('/editDocument', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "editDocument"});
    }
});

FlowRouter.route('/fileManagement', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "fileManagement"});
    }
});

FlowRouter.route('/settings', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "settings"});
    }
});

FlowRouter.route('/userManagement', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "userManagement"});
    }
});