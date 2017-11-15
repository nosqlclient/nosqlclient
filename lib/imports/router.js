import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'notFound' });
  },
};

FlowRouter.route('/', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'databaseStats' });
  },
});

FlowRouter.route('/shell', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'mcShell' });
  },
});

FlowRouter.route('/storedFunctions', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'storedFunctions' });
  },
});


FlowRouter.route('/schemaAnalyzer', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'schemaAnalyzer' });
  },
});

FlowRouter.route('/adminQueries', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'adminQueries' });
  },
});

FlowRouter.route('/aggregatePipeline', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'aggregatePipeline' });
  },
});

FlowRouter.route('/browseCollection', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'browseCollection' });
  },
});

FlowRouter.route('/databaseDumpRestore', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'databaseDumpRestore' });
  },
});

FlowRouter.route('/databaseStats', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'databaseStats' });
  },
});

FlowRouter.route('/indexManagement', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'indexManagement' });
  },
});

FlowRouter.route('/fileManagement', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'fileManagement' });
  },
});

FlowRouter.route('/settings', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'settings' });
  },
});

FlowRouter.route('/userManagement', {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'userManagement' });
  },
});
