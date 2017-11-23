import { Notification, UIComponents, Enums, SessionManager, ErrorHandler } from '/client/imports/modules';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
import moment from 'moment';

const Shell = function () {
  this.lastRegex = null;
};

Shell.prototype = {
  initShellHistories() {
    Notification.start('#btnUseHistoricalShellQuery');

    const history = JSON.parse(localStorage.getItem(Enums.LOCAL_STORAGE_KEYS.SHELL_COMMAND_HISTORY) || '[]');
    UIComponents.DataTable.setupDatatable({
      selectorString: '#tblShellHistories',
      columns: [
        {
          data: 'command',
          width: '80%',
        },
        {
          data: 'date',
          width: '20%',
          render(cellData) {
            return moment(cellData).format('YYYY-MM-DD HH:mm:ss');
          },
        },
      ],
      autoWidth: false,
      lengthMenu: [5, 10, 20],
      data: history
    });

    Notification.stop();
  },

  addCommandToHistory(command) {
    let oldOnes = localStorage.getItem(Enums.LOCAL_STORAGE_KEYS.SHELL_COMMAND_HISTORY) || '[]';
    if (oldOnes) oldOnes = JSON.parse(oldOnes);
    if (oldOnes.length >= 50) oldOnes.splice(0, oldOnes.length - 19);

    oldOnes.push({ command, date: new Date() });
    localStorage.setItem(Enums.LOCAL_STORAGE_KEYS.SHELL_COMMAND_HISTORY, JSON.stringify(oldOnes));
  },

  gatherCollectionNames() {
    const mainResult = [];
    for (let i = 0; i < SessionManager.get(SessionManager.strSessionCollectionNames).length; i += 1) mainResult.push(SessionManager.get(SessionManager.strSessionCollectionNames)[i].name);
    return mainResult;
  },

  analyzeEditorValue(editorValue) {
    if (!editorValue) return;
    if (/find\(.*\).$/gi.test(editorValue)) return 'cursor';
    if (/db.$/gi.test(editorValue)) return 'db';
    if (/rs.$/gi.test(editorValue)) return 'replication';
    if (/sh.$/gi.test(editorValue)) return 'sharding';
    if (/getPlanCache\(\).$/gi.test(editorValue)) return 'planCache';

    return 'collection';
  },

  gatherCommandAutoCompletions(editorValue, curWord) {
    if (curWord) return this.lastRegex;
    let matched = editorValue.match(/[^\s"']+|"([^"]*)"|'([^']*)'/gm);
    matched = matched ? matched.join('') : '';
    editorValue = !editorValue ? editorValue : matched;

    switch (this.analyzeEditorValue(editorValue)) {
      case 'collection':
        this.lastRegex = ['aggregate(', 'bulkWrite(', 'count(', 'copyTo(',
          'craeteIndex(', 'dataSize(', 'deleteOne(', 'deleteMany(',
          'distinct(', 'drop(', 'dropIndex(', 'dropIndexes(', 'ensureIndex(', 'explain(', 'find(',
          'findAndModify(', 'findOne(', 'findOneAndDelete(', 'findOneAndReplace(',
          'findOneAndUpdate(', 'getIndexes(', 'getPlanCache(', 'getShardDistribution(', 'getShardVersion(',
          'group(', 'insert(', 'insertOne(', 'insertMany(', 'isCapped(', 'latencyStats(', 'mapReduce(',
          'reIndex(', 'replaceOne(', 'remove(', 'renameCollection(', 'save(', 'stats(',
          'storageSize(', 'totalSize(', 'totalIndexSize(', 'update(', 'updateOne(', 'updateMany(', 'validate('];
        break;
      case 'cursor':
        this.lastRegex = ['addOption(', 'collation(', 'batchSize(', 'close(', 'comment(', 'count(', 'explain(',
          'forEach(', 'hasNext(', 'hint(', 'itcount(', 'limit(', 'map(', 'maxScan(', 'maxTimeMS(', 'max(',
          'min(', 'next(', 'noCursorTimeout(', 'objsLeftInBatch(', 'pretty(', 'readConcern(', 'readPref(',
          'returnKey(', 'showRecordId(', 'size(', 'skip(', 'snapshot(', 'sort(', 'tailable(', 'toArray('];
        break;
      case 'db':
        this.lastRegex = this.gatherCollectionNames().concat(['cloneCollection(', 'cloneDatabase(',
          'commandHelp(', 'createView(', 'copyDatabase(', 'createCollection(', 'currentOp(',
          'dropDatabase(', 'eval(', 'fsyncLock(', 'fsyncUnlock(', 'getCollection(',
          'getCollectionInfos(', 'getCollectionNames(', 'getLastError(', 'getLastErrorObj(', 'getLogComponents(',
          'getMongo(', 'getName(', 'getPrevError(', 'getProfilingLevel(', 'getProfilingStatus(', 'getReplicationInfo(',
          'getSiblingDB(', 'help(', 'hostInfo(', 'isMaster(', 'killOp(', 'listCommands(', 'loadServerScripts(', 'logout(',
          'printCollectionStats(', 'printReplicationInfo(', 'printShardingStatus(', 'printSlaveReplicationInfo(', 'repairDatabase(',
          'resetError(', 'runCommand(', 'serverBuildInfo(', 'serverCmdLineOpts(', 'serverStatus(', 'setLogLevel(', 'setProfilingLevel(',
          'shutdownServer(', 'stats(', 'version(', 'upgradeCheck(', 'upgradeCheckAllDBs(', 'auth(', 'createUser(', 'updateUser(', 'changeUserPassword(',
          'removeUser(', 'dropAllUsers(', 'dropUser(', 'grantRolesToUsers(', 'revokeRolesFromUser(', 'getUser(', 'getUsers(', 'createRole(', 'updateRole(',
          'dropRole(', 'dropAllRoles(', 'grantPrivilegesToRole(', 'revokePrivilegesFromRole(', 'grantRolesToRole(', 'revokeRolesFromRole(', 'getRole(', 'getRoles(']);
        break;
      case 'planCache':
        this.lastRegex = ['help(', 'listQueryShapes(', 'getPlansByQuery(', 'clearPlansByQuery(', 'clear('];
        break;
      case 'replication':
        this.lastRegex = ['add(', 'addArb(', 'conf(', 'freeze(', 'help(', 'initiate(', 'printReplicationInfo(', 'printSlaveReplicationInfo(',
          'reconfig(', 'remove(', 'slaveOk(', 'status(', 'stepDown(', 'syncFrom('];
        break;
      case 'sharding':
        this.lastRegex = ['_adminCommand(', 'addShardToZone(', 'removeShardFromZone(', 'getBalancerLockDetails(', '_checkFullName(', '_checkMongos(', '_lastMigration(',
          'addShard(', 'addShardTag(', 'updateZoneKeyRange(', 'removeRangeFromZone(',
          'addTagRange(', 'removeTagRange(', 'disableBalancing(', 'enableBalancing(', 'enableSharding(', 'getBalancerHost(', 'getBalancerState(', 'help(', 'isBalancerRunning(',
          'moveChunk(', 'removeShardTag(', 'setBalancerState(', 'shardCollection(', 'splitAt(', 'splitFind(', 'startBalancer(', 'status(', 'stopBalancer(', 'waitForBalancer(',
          'waitForBalancerOff(', 'waitForDLock(', 'waitForPingChange('];
        break;
      default:
        if (!editorValue || (editorValue.indexOf('.') === -1 && editorValue.indexOf('(') === -1 && editorValue.indexOf(')') === -1)) {
          this.lastRegex = ['db', 'rs', 'sh', 'Date(', 'UUID(',
            'ObjectId(', 'cat(', 'version(', 'cd(', 'sleep(',
            'copyDbpath(', 'resetDbpath(', 'fuzzFile(', 'getHostName(',
            'getMemInfo(', 'hostname(', '_isWindows(', 'listFiles(',
            'load(', 'ls(', 'md5sumFile(', 'mkdir(', 'pwd(', 'quit(', '_rand(',
            'removeFile(', 'setVerboseShell(', '_srand('];
        }
        break;
    }

    return this.lastRegex;
  },

  clear() {
    UIComponents.Editor.setCodeMirrorValue($('#divShellResult'), '');
    Communicator.call({ methodName: 'clearShell' });
  },

  init() {
    $('#shellHistoriesModal').on('shown.bs.modal', () => { Shell.initShellHistories(); });

    const divResult = $('#divShellResult');
    const divCommand = $('#divShellCommand');
    UIComponents.Editor.initializeCodeMirror({ divSelector: divResult, txtAreaId: 'txtShellResult', height: 600 });
    divResult.data('editor').setOption('readOnly', true);

    ReactivityProvider.observeChanges(
      ReactivityProvider.types.ShellCommands,
      {
        connectionId: SessionManager.get(SessionManager.strSessionConnection)._id,
        sessionId: Meteor.default_connection._lastSessionId,
      },
      { sort: { date: -1 } },
      {
        added(id, fields) {
          let previousValue = UIComponents.Editor.getCodeMirrorValue(divResult);
          if (previousValue && !previousValue.endsWith('\n')) previousValue += '\n';

          const editorResult = divResult.data('editor');

          UIComponents.Editor.setCodeMirrorValue(divResult, previousValue + fields.message);
          if (editorResult) {
            editorResult.focus();
            editorResult.setCursor(editorResult.lineCount(), 0);
          }

          if (divCommand.data('editor')) divCommand.data('editor').focus();
        }
      });

    Communicator.call({
      methodName: 'connectToShell',
      args: {
        connectionId: SessionManager.get(SessionManager.strSessionConnection)._id,
        username: SessionManager.get(SessionManager.strSessionPromptedUsername),
        password: SessionManager.get(SessionManager.strSessionPromptedPassword)
      },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't connect via shell");
        else this.addCommandToHistory(result);
      }
    });
  },

  initializeCommandCodeMirror() {
    const extraKeysToAppend = {
      Enter(cm) {
        Communicator.call({
          methodName: 'executeShellCommand',
          args: {
            command: cm.getValue,
            connectionId: SessionManager.get(SessionManager.strSessionConnection)._id,
            username: SessionManager.get(SessionManager.strSessionPromptedUsername),
            password: SessionManager.get(SessionManager.strSessionPromptedPassword)
          },
          callback: (err) => {
            if (err) ErrorHandler.showMeteorFuncError(err, null, "Couldn't execute shell command");
            else this.addCommandToHistory(cm.getValue());
          }
        });
      }
    };

    UIComponents.Editor.initializeCodeMirror({
      divSelector: $('#divShellCommand'),
      txtAreaId: 'txtShellCommand',
      height: 50,
      extraKeysToAppend,
      autoCompleteListMethod: this.gatherCommandAutoCompletions
    });
  }
};

export default new Shell();
