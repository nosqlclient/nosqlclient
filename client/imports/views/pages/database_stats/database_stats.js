import { Template } from 'meteor/templating';
import { DBStats } from '/client/imports/ui';
import { SessionManager } from '/client/imports/modules';
import { ReactivityProvider } from '/client/imports/facades';
import './database_stats.html';

Template.databaseStats.events({
  'click #btnSubscribe': function () {
    DBStats.subscribe();
  },
});

Template.databaseStats.onRendered(function () {
  const settings = this.subscribe('settings');
  const connections = this.subscribe('connections');

  $('#divCollectionsReadWrite').slimScroll({
    height: '200px',
    railOpacity: 0.9,
  });

  this.autorun(() => {
    if (settings.ready() && connections.ready()) {
      DBStats.init();
    }
  });
});

Template.databaseStats.onDestroyed(() => {
  DBStats.clear();
});

Template.databaseStats.helpers({
  isSubscribed() {
    const settings = ReactivityProvider.findOne(ReactivityProvider.types.Settings);
    return settings ? settings.subscribed : false;
  },

  getServerStatus() {
    if (ReactivityProvider.findOne(ReactivityProvider.types.Settings).showDBStats) {
      if (!SessionManager.get(SessionManager.strSessionServerStatus)) DBStats.fetchStatus();

      return SessionManager.get(SessionManager.strSessionServerStatus);
    }
  },

  getDBStats() {
    if (ReactivityProvider.findOne(ReactivityProvider.types.Settings).showDBStats) {
      if (!SessionManager.get(SessionManager.strSessionDBStats)) DBStats.fetchStats();

      return SessionManager.get(SessionManager.strSessionDBStats);
    }
  },
});
