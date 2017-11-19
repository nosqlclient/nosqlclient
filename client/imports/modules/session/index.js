import { Session } from 'meteor/session';

const SessionManager = function () {
  this.keys = {
    strSessionPromptedUsername: 'promptedUsername',
    strSessionPromptedPassword: 'promptedPassword',
    strSessionConnection: 'connection',
    strSessionCollectionNames: 'collectionNames',
    strSessionSelectedCollection: 'selectedCollection',
    strSessionSelectedQuery: 'selectedQuery',
    strSessionSelectedOptions: 'selectedOptions',
    strSessionServerStatus: 'serverStatus',
    strSessionDBStats: 'dbStats',
    strSessionUsedTabIDs: 'usedTabIDs',
    strSessionUsedTabIDsAggregate: 'usedTabIDsAggregate',
    strSessionSelectedFile: 'selectedFile',
    strSessionSelectedStoredFunction: 'selectedStoredFunction',
    strSessionDistinctFields: 'distinctFields',
    strSessionSelectedQueryHistory: 'selectedQueryHistory',
    strSessionSelectedShellHistory: 'selectedShellHistory',
    strSessionSelectedAggregateHistory: 'selectedAggregateHistory',
    strSessionSelectorValue: 'selectorValue',
    strSessionSelectionUserManagement: 'userManagementValue',
    strSessionUsermanagementInfo: 'userManagementInfo',
    strSessionUsermanagementManageSelection: 'userManagementManageSelection',
    strSessionUsermanagementUser: 'userManagementUser',
    strSessionUsermanagementRole: 'userManagementRole',
    strSessionUsermanagementPrivilege: 'userManagementPrivilege',
    strSessionSelectedAddCollectionOptions: 'selectedAddCollectionOptions',
    strSessionMongodumpArgs: 'selectedMongodumpArgs',
    strSessionMongorestoreArgs: 'selectedMongorestoreArgs',
    strSessionMongoexportArgs: 'selectedMongoexportArgs',
    strSessionMongoimportArgs: 'selectedMongoimportArgs',
  };
};

SessionManager.prototype = {
  get(key) {
    return Session.get(key);
  },

  set(key, value) {
    Session.set(key, value);
  },

  remove(key) {
    Session.set(key, null);
  },

  clear() {
    Object.keys(Session.keys).forEach((key) => {
      Session.set(key, null);
    });
  }
};

export default new SessionManager();
