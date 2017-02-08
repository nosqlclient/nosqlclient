import {FlowRouter} from 'meteor/kadira:flow-router';
import {BlazeLayout} from 'meteor/kadira:blaze-layout';

FlowRouter.notFound = {
    action: function () {
        BlazeLayout.render('mainLayout', {yield: 'notFound'});
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

FlowRouter.route('/storedFunctions', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "storedFunctions"});
    }
});


FlowRouter.route('/schemaAnalyzer', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "schemaAnalyzer"});
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

FlowRouter.route('/indexManagement', {
    action: function () {
        BlazeLayout.render("mainLayout", {yield: "indexManagement"});
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