/**
 * Created by Sercan on 12.11.2016.
 */

/**

 var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
  lineNumbers: true,
  styleSelectedText: true
});
 editor.markText({line: 6, ch: 26}, {line: 6, ch: 42}, {className: "styled-background"});
 * */

import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import ShellCommands from '/lib/imports/collections/shell';

import './mc_shell.html';

var toastr = require('toastr');
let connected;

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

    let divCommand = $('#divShellCommand');
    Helper.initializeCodeMirror(divCommand, 'txtShellCommand', false, 50, function (e) {
        Meteor.call("executeShellCommand", Helper.getCodeMirrorValue(divCommand), (err) => {
            if (err) {
                Helper.showMeteorFuncError(err, null, "Couldn't execute shell command");
            }
        });
    });

    ShellCommands.find({connectionId: Session.get(Helper.strSessionConnection)}, {sort: {date: -1}}).observeChanges({
        added: function (id, fields) {
            let previousValue = Helper.getCodeMirrorValue(divResult);
            if (previousValue && !previousValue.endsWith('\n')) {
                previousValue += '\n';
            }
            Helper.setCodeMirrorValue(divResult, previousValue + fields.message);
            divResult.data('editor').focus();
            divResult.data('editor').setCursor(divResult.data('editor').lineCount(), 0);
            divCommand.data('editor').focus();
        }
    });

    Meteor.call("connectToShell", Session.get(Helper.strSessionConnection), (err) => {
        if (err) {
            Helper.showMeteorFuncError(err, null, "Couldn't connect via shell");
        } else {
            connected = true;
        }

    });
});
