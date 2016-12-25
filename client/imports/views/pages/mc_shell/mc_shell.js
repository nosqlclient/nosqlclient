/**
 * Created by Sercan on 12.11.2016.
 */

import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {FlowRouter} from 'meteor/kadira:flow-router';
import Helper from '/client/imports/helper';
import ShellCommands from '/lib/imports/collections/shell';

import './mc_shell.html';

const CodeMirror = require("codemirror");
let connected, lastRegex;

require("/node_modules/codemirror/mode/javascript/javascript.js");
require("/node_modules/codemirror/addon/fold/brace-fold.js");
require("/node_modules/codemirror/addon/fold/comment-fold.js");
require("/node_modules/codemirror/addon/fold/foldcode.js");
require("/node_modules/codemirror/addon/fold/foldgutter.js");
require("/node_modules/codemirror/addon/fold/indent-fold.js");
require("/node_modules/codemirror/addon/fold/markdown-fold.js");
require("/node_modules/codemirror/addon/fold/xml-fold.js");
require("/node_modules/codemirror/addon/hint/javascript-hint.js");
require("/node_modules/codemirror/addon/hint/show-hint.js");


const gatherCollectionNames = function () {
    let mainResult = [];
    for (let i = 0; i < Session.get(Helper.strSessionCollectionNames).length; i++) {
        mainResult.push(Session.get(Helper.strSessionCollectionNames)[i].name);
    }

    return mainResult;
};

const analyzeEditorValue = function (editorValue) {
    if (!editorValue) {
        return;
    }

    if (/find\(.*\).$/gi.test(editorValue)) {
        return 'cursor';
    }

    if (/db.$/gi.test(editorValue)) {
        return 'db';
    }

    if (/rs.$/gi.test(editorValue)) {
        return 'replication';
    }

    if (/sh.$/gi.test(editorValue)) {
        return 'sharding';
    }

    if (/getPlanCache\(\).$/gi.test(editorValue)) {
        return 'planCache';
    }

    return 'collection';
};

const gatherCommandAutoCompletions = function (editorValue, curWord) {
    if (curWord) {
        return lastRegex;
    }
    let matched = editorValue.match(/[^\s"']+|"([^"]*)"|'([^']*)'/gm);
    editorValue = !editorValue ? editorValue : (matched ? matched.join('') : '');

    switch (analyzeEditorValue(editorValue)) {
        case 'collection':
            return lastRegex = ['aggregate(', 'bulkWrite(', 'count(', 'copyTo(', 'createView(',
                'craeteIndex(', 'dataSize(', 'deleteOne(', 'deleteMany(',
                'distinct(', 'drop(', 'dropIndex(', 'dropIndexes(', 'ensureIndex(', 'explain(', 'find(',
                'findAndModify(', 'findOne(', 'findOneAndDelete(', 'findOneAndReplace(',
                'findOneAndUpdate(', 'getIndexes(', 'getPlanCache(', 'getShardDistribution(', 'getShardVersion(',
                'group(', 'insert(', 'insertOne(', 'insertMany(', 'isCapped(', 'mapReduce(',
                'reIndex(', 'replaceOne(', 'remove(', 'renameCollection(', 'save(', 'stats(',
                'storageSize(', 'totalSize(', 'totalIndexSize(', 'update(', 'updateOne(', 'updateMany(', 'validate('];
        case 'cursor':
            return lastRegex = ['addOption(', 'collation(', 'batchSize(', 'close(', 'comment(', 'count(', 'explain(',
                'forEach(', 'hasNext(', 'hint(', 'itcount(', 'limit(', 'map(', 'maxScan(', 'maxTimeMS(', 'max(',
                'min(', 'next(', 'noCursorTimeout(', 'objsLeftInBatch(', 'pretty(', 'readConcern(', 'readPref(',
                'returnKey(', 'showRecordId(', 'size(', 'skip(', 'snapshot(', 'sort(', 'tailable(', 'toArray('];
        case 'db':
            return lastRegex = gatherCollectionNames().concat(['cloneCollection(', 'cloneDatabase(',
                'commandHelp(', 'copyDatabase(', 'createCollection(', 'currentOp(',
                'dropDatabase(', 'eval(', 'fsyncLock(', 'fsyncUnlock(', 'getCollection(',
                'getCollectionInfos(', 'getCollectionNames(', 'getLastError(', 'getLastErrorObj(', 'getLogComponents(',
                'getMongo(', 'getName(', 'getPrevError(', 'getProfilingLevel(', 'getProfilingStatus(', 'getReplicationInfo(',
                'getSiblingDB(', 'help(', 'hostInfo(', 'isMaster(', 'killOp(', 'listCommands(', 'loadServerScripts(', 'logout(',
                'printCollectionStats(', 'printReplicationInfo(', 'printShardingStatus(', 'printSlaveReplicationInfo(', 'repairDatabase(',
                'resetError(', 'runCommand(', 'serverBuildInfo(', 'serverCmdLineOpts(', 'serverStatus(', 'setLogLevel(', 'setProfilingLevel(',
                'shutdownServer(', 'stats(', 'version(', 'upgradeCheck(', 'upgradeCheckAllDBs(', 'auth(', 'createUser(', 'updateUser(', 'changeUserPassword(',
                'removeUser(', 'dropAllUsers(', 'dropUser(', 'grantRolesToUsers(', 'revokeRolesFromUser(', 'getUser(', 'getUsers(', 'createRole(', 'updateRole(',
                'dropRole(', 'dropAllRoles(', 'grantPrivilegesToRole(', 'revokePrivilegesFromRole(', 'grantRolesToRole(', 'revokeRolesFromRole(', 'getRole(', 'getRoles(']);
        case 'planCache':
            return lastRegex = ['help(', 'listQueryShapes(', 'getPlansByQuery(', 'clearPlansByQuery(', 'clear('];
        case 'replication':
            return lastRegex = ['add(', 'addArb(', 'conf(', 'freeze(', 'help(', 'initiate(', 'printReplicationInfo(', 'printSlaveReplicationInfo(',
                'reconfig(', 'remove(', 'slaveOk(', 'status(', 'stepDown(', 'syncFrom('];
        case 'sharding':
            return lastRegex = ['_adminCommand(', 'addShardToZone(', 'removeShardFromZone(', 'getBalancerLockDetails(', '_checkFullName(', '_checkMongos(', '_lastMigration(',
                'addShard(', 'addShardTag(', 'updateZoneKeyRange(', 'removeRangeFromZone(',
                'addTagRange(', 'removeTagRange(', 'disableBalancing(', 'enableBalancing(', 'enableSharding(', 'getBalancerHost(', 'getBalancerState(', 'help(', 'isBalancerRunning(',
                'moveChunk(', 'removeShardTag(', 'setBalancerState(', 'shardCollection(', 'splitAt(', 'splitFind(', 'startBalancer(', 'status(', 'stopBalancer(', 'waitForBalancer(',
                'waitForBalancerOff(', 'waitForDLock(', 'waitForPingChange('];
        default :
            if (!editorValue || (editorValue.indexOf('.') === -1 && editorValue.indexOf('(') === -1 && editorValue.indexOf(')') === -1)) {
                return lastRegex = ['db', 'rs', 'sh', 'Date(', 'UUID(',
                    'ObjectId(', 'cat(', 'version(', 'cd(', 'sleep(',
                    'copyDbpath(', 'resetDbpath(', 'fuzzFile(', 'getHostName(',
                    'getMemInfo(', 'hostname(', '_isWindows(', 'listFiles(',
                    'load(', 'ls(', 'md5sumFile(', 'mkdir(', 'pwd(', 'quit(', '_rand(',
                    'removeFile(', 'setVerboseShell(', '_srand('];
            }
    }

    return [];
};

const initializeCommandCodeMirror = function () {
    let codeMirror;
    let divCommand = $('#divShellCommand');
    if (!divCommand.data('editor')) {
        codeMirror = CodeMirror.fromTextArea(document.getElementById('txtShellCommand'), {
            mode: "javascript",
            theme: "neat",
            styleActiveLine: true,
            lineNumbers: true,
            lineWrapping: false,
            extraKeys: {
                "Ctrl-Q": function (cm) {
                    cm.foldCode(cm.getCursor());
                },
                "Ctrl-Space": "autocomplete",
                "Enter": function (cm) {
                    Meteor.call("executeShellCommand", cm.getValue(), (err) => {
                        if (err) {
                            Helper.showMeteorFuncError(err, null, "Couldn't execute shell command");
                        }
                    })
                }
            },
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
        codeMirror.setSize('%100', 50);

        CodeMirror.hint.javascript = function (editor) {
            let cursor = editor.getCursor();
            let currentLine = editor.getLine(cursor.line);
            let start = cursor.ch;
            let end = start;
            while (end < currentLine.length && /[\w$]+/.test(currentLine.charAt(end))) ++end;
            while (start && /[\w$]+/.test(currentLine.charAt(start - 1))) --start;
            let curWord = start != end && currentLine.slice(start, end);
            let list = gatherCommandAutoCompletions(editor.getValue(), curWord) || [];
            let regex = new RegExp('^' + curWord, 'i');
            return {
                list: (!curWord ? list : list.filter(function (item) {
                        return item.match(regex);
                    })),
                from: CodeMirror.Pos(cursor.line, start),
                to: CodeMirror.Pos(cursor.line, end)
            };
        };

        divCommand.data('editor', codeMirror);

        codeMirror.focus();
    }
};

Template.mcShell.events({
    'click #btnClearShell': function () {
        Helper.setCodeMirrorValue($('#divShellResult'), '');
        Meteor.call('clearShell');
    },

    'click #btnCloseShell': function () {
        if (connected) {
            Meteor.call("closeShell", (err) => {
                if (err) {
                    Helper.showMeteorFuncError(err, null, "Couldn't close shell");
                } else {
                    $('#btnCloseShell').text('Re-connect');
                    connected = false;
                }
            });
        } else {
            Meteor.call("connectToShell", Session.get(Helper.strSessionConnection), (err) => {
                if (err) {
                    Helper.showMeteorFuncError(err, null, "Couldn't connect via shell");
                } else {
                    $('#btnCloseShell').text('Close Shell');
                    connected = true;
                }
            });
        }
    }
});

Template.mcShell.onDestroyed(function () {
    if (!connected) {
        return;
    }

    Meteor.call("closeShell", (err) => {
        if (err) {
            Helper.showMeteorFuncError(err, null, "Couldn't close shell");
        }
    });
});

Template.mcShell.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');
    let shellCommands = this.subscribe('shell_commands');

    this.autorun(() => {
        if (settings.ready() && connections.ready() && shellCommands.ready()) {
            let divResult = $('#divShellResult');
            let divCommand = $('#divShellCommand');
            Helper.initializeCodeMirror(divResult, 'txtShellResult', false, 600);
            divResult.data('editor').setOption("readOnly", true);

            ShellCommands.find({connectionId: Session.get(Helper.strSessionConnection)}, {sort: {date: -1}}).observeChanges({
                added: function (id, fields) {
                    let previousValue = Helper.getCodeMirrorValue(divResult);
                    if (previousValue && !previousValue.endsWith('\n')) {
                        previousValue += '\n';
                    }

                    let editorResult = divResult.data('editor');

                    Helper.setCodeMirrorValue(divResult, previousValue + fields.message);
                    if (editorResult) {
                        editorResult.focus();
                        editorResult.setCursor(editorResult.lineCount(), 0);
                    }

                    if (divCommand.data('editor')) {
                        divCommand.data('editor').focus();
                    }
                }
            });

            initializeCommandCodeMirror();

            Meteor.call("connectToShell", Session.get(Helper.strSessionConnection), (err) => {
                if (err) {
                    Helper.showMeteorFuncError(err, null, "Couldn't connect via shell");
                } else {
                    connected = true;
                }
            });
        }
    });
});
