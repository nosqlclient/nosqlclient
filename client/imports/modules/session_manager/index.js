import { ReactiveDict } from 'meteor/reactive-dict';

const SessionManager = function () {
  this.dictionary = new ReactiveDict();
};

SessionManager.prototype = {
  get(key) {
    if (!key) return;
    return this.dictionary.get(key);
  },

  set(key, value) {
    if (!key) return;
    this.dictionary.set(key, value);
  },

  remove(key) {
    if (!key) return;
    this.dictionary.set(key, null);
  },

  clear() {
    Object.keys(this.dictionary.keys).forEach((key) => {
      this.dictionary.delete(key);
    });
  },

  strSessionApplicationLanguage: 'applicationLanguage',
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
  strSessionMongoimportArgs: 'selectedMongoimportArgs'
};

export default new SessionManager();
