/**
 * Created by Sercan on 12.11.2016.
 */

import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import ShellCommands from '/lib/imports/collections/shell';
import {Connections} from '/lib/imports/collections/connections';

import './mc_shell.html';

const CodeMirror = require("codemirror");
const toastr = require('toastr');
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
    if (/find\(.*\)$|find\(.*\).$/gi.test(editorValue)) {
        return 'cursor';
    }

    let collectionRegex = "";
    const collectionNames = gatherCollectionNames();
    for (let i = 0; i < collectionNames.length; i++) {
        collectionRegex += 'db.' + collectionNames[i] + '.|';
    }
    if (collectionRegex.endsWith('|')) {
        collectionRegex = collectionRegex.substring(0, collectionRegex.length - 1);
    }

    if (new RegExp(collectionRegex, 'gi').test(editorValue)) {
        return 'collection';
    }

    if (/db.$|db$/gi.test(editorValue)) {
        return 'db';
    }
};

const gatherCommandAutoCompletions = function (editorValue, curWord) {
    if (curWord) {
        return lastRegex;
    }

    editorValue = !editorValue ? editorValue : editorValue.match(/[^\s"']+|"([^"]*)"|'([^']*)'/gm).join('');
    switch (analyzeEditorValue(editorValue)) {
        case 'collection':
            console.log('collection');
            break;
        case 'cursor':
            console.log('cursor');
            break;
        case 'db':
            console.log('db');
            break;
        case 'planCache':
            console.log('planCache');
            break;
        case 'replication':
            console.log('replication');
            break;
        case 'sharding':
            console.log('sharding');
            break;
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

    return gatherCollectionNames();
};

const initializeCommandCodeMirror = function () {
    var codeMirror;
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
            var cursor = editor.getCursor();
            var currentLine = editor.getLine(cursor.line);
            var start = cursor.ch;
            var end = start;
            while (end < currentLine.length && /[\w$]+/.test(currentLine.charAt(end))) ++end;
            while (start && /[\w$]+/.test(currentLine.charAt(start - 1))) --start;
            var curWord = start != end && currentLine.slice(start, end);
            var list = gatherCommandAutoCompletions(editor.getValue(), curWord);
            var regex = new RegExp('^' + curWord, 'i');
            return {
                list: (!curWord ? list : list.filter(function (item) {
                    return item.match(regex);
                })),
                from: CodeMirror.Pos(cursor.line, start),
                to: CodeMirror.Pos(cursor.line, end)
            };
        };

        divCommand.data('editor', codeMirror);

        $('.CodeMirror').resizable({
            resize: function () {
                codeMirror.setSize($(this).width(), $(this).height());
            }
        });

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
        Router.go('databaseStats');
        return;
    }

    let divResult = $('#divShellResult');
    Helper.initializeCodeMirror(divResult, 'txtShellResult', false, 600);
    divResult.data('editor').setOption("readOnly", true);

    ShellCommands.find({connectionId: Session.get(Helper.strSessionConnection)}, {sort: {date: -1}}).observeChanges({
        added: function (id, fields) {
            let previousValue = Helper.getCodeMirrorValue(divResult);
            if (previousValue && !previousValue.endsWith('\n')) {
                previousValue += '\n';
            }
            Helper.setCodeMirrorValue(divResult, previousValue + fields.message);
            divResult.data('editor').focus();
            divResult.data('editor').setCursor(divResult.data('editor').lineCount(), 0);
            if ($('#divShellCommand').data('editor')) {
                $('#divShellCommand').data('editor').focus();
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
});
