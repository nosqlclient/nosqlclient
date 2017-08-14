/**
 * Created by RSercan on 26.12.2015.
 */
import {Blaze} from "meteor/blaze";
import {Template} from "meteor/templating";
import {Session} from "meteor/session";
import {Meteor} from "meteor/meteor";
import {$} from "meteor/jquery";
import {Connections, Settings} from "/lib/imports/collections";
import {setAdminResult} from "/client/imports/views/pages/admin_queries/admin_queries";
import {setQueryResult} from "/client/imports/views/pages/browse_collection/browse_collection";
import {getSelectorValue} from "/client/imports/views/query_templates_options/selector/selector";

const toastr = require('toastr');
const Ladda = require('ladda');
const fbbkJson = require("fbbk-json");
const CodeMirror = require("codemirror");

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

const checkOption = function (val, result, optionEnum, option) {
    if (val == "") result[optionEnum[option]] = {};
    else {
        val = helper.convertAndCheckJSON(val);
        if (val['ERROR']) {
            result["ERROR"] = "Syntax Error on " + optionEnum[option] + ": " + val['ERROR'];
        } else {
            result[optionEnum[option]] = val;
        }
    }
};

const extractMiddleString = function (str) {
    if (!str) {
        return "";
    }

    return str.substring(str.indexOf("\"") + 1, str.lastIndexOf("\""));
};

const replaceShellStuff = function (str, regex, extendedJsonVersion) {
    let matches = str.match(regex);
    if (matches) {
        for (let i = 0; i < matches.length; i++) {
            str = str.replace(matches[i], "{" + extendedJsonVersion + ":\"" + extractMiddleString(matches[i]) + "\"}");
        }
    }

    return str;
};

//supporting shell commands for ObjectID and ISODate, https://docs.mongodb.com/manual/reference/mongodb-extended-json/
const convertToExtendedJson = function (str) {
    if (!str || Object.prototype.toString.call(str) !== '[object String]') {
        return;
    }

    // support shell stuff
    // replace objectID variations with $oid
    str = replaceShellStuff(str, /objectid\("[A-Z0-9]*"\)/gmi, "$oid");

    // replace ISODate|date variations with $date
    str = replaceShellStuff(str, /isodate\("[A-Z0-9- :.]*"\)|date\("[A-Z0-9- :.]*"\)|newdate\("[A-Z0-9- :.]*"\)|newisodate\("[A-Z0-9 -:.]*"\)/gmi, "$date");

    return str;
};

let Helper = function () {
    this.strSessionPromptedUsername = "promptedUsername";
    this.strSessionPromptedPassword = "promptedPassword";
    this.strSessionConnection = "connection";
    this.strSessionCollectionNames = "collectionNames";
    this.strSessionSelectedCollection = "selectedCollection";
    this.strSessionSelectedQuery = "selectedQuery";
    this.strSessionSelectedOptions = "selectedOptions";
    this.strSessionServerStatus = "serverStatus";
    this.strSessionDBStats = "dbStats";
    this.strSessionUsedTabIDs = "usedTabIDs";
    this.strSessionUsedTabIDsAggregate = "usedTabIDsAggregate";
    this.strSessionSelectedFile = "selectedFile";
    this.strSessionSelectedStoredFunction = "selectedStoredFunction";
    this.strSessionDistinctFields = "distinctFields";
    this.strSessionSelectedQueryHistory = "selectedQueryHistory";
    this.strSessionSelectedShellHistory = "selectedShellHistory";
    this.strSessionSelectedAggregateHistory = "selectedAggregateHistory";
    this.strSessionSelectorValue = "selectorValue";
    this.strSessionSelectionUserManagement = "userManagementValue";
    this.strSessionUsermanagementInfo = "userManagementInfo";
    this.strSessionUsermanagementManageSelection = "userManagementManageSelection";
    this.strSessionUsermanagementUser = "userManagementUser";
    this.strSessionUsermanagementRole = "userManagementRole";
    this.strSessionUsermanagementPrivilege = "userManagementPrivilege";
    this.strSessionSelectedAddCollectionOptions = "selectedAddCollectionOptions";
    this.strSessionMongodumpArgs = "selectedMongodumpArgs";
    this.strSessionMongorestoreArgs = "selectedMongorestoreArgs";
    this.strSessionMongoexportArgs = "selectedMongoexportArgs";
    this.strSessionMongoimportArgs = "selectedMongoimportArgs";
};

Helper.prototype = {
    initializeCollectionsCombobox () {
        const cmb = $('#cmbCollections');
        cmb.append($("<optgroup id='optGroupCollections' label='Collections'></optgroup>"));
        const cmbOptGroupCollection = cmb.find('#optGroupCollections');

        const collectionNames = Session.get(this.strSessionCollectionNames);
        $.each(collectionNames, function (index, value) {
            cmbOptGroupCollection.append($("<option></option>")
                .attr("value", value.name)
                .text(value.name));
        });
        cmb.chosen();

        cmb.on('change', (evt, params) => {
            const selectedCollection = params.selected;
            if (selectedCollection) {
                this.getDistinctKeysForAutoComplete(selectedCollection);
            }
        });
    },

    attachDeleteTableRowEvent (selector){
        selector.find('tbody').on('click', 'a.editor_delete', function () {
            selector.DataTable().row($(this).parents('tr')).remove().draw();
        });
    },

    doTableRowSelectable(table, row){
        if (row.hasClass('selected')) {
            row.removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            row.addClass('selected');
        }
    },

    clearSessions () {
        Object.keys(Session.keys).forEach(function (key) {
            Session.set(key, undefined);
        })
    },

    initiateDatatable (selector, sessionKey, noDeleteEvent) {
        selector.find('tbody').on('click', 'tr', function () {
            const table = selector.DataTable();
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
            }
            else {
                table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            }

            if (table.row(this).data() && sessionKey) {
                Session.set(sessionKey, table.row(this).data());
            }
        });

        if (!noDeleteEvent) {
            this.attachDeleteTableRowEvent(selector);
        }
    },

    renderAfterQueryExecution (err, result, isAdmin, queryInfo, queryParams, saveHistory) {
        if (err || result.error) {
            this.showMeteorFuncError(err, result, "Couldn't execute query");
        }
        else {
            if (isAdmin) {
                setAdminResult(result.result);
            } else {
                setQueryResult(result.result, queryInfo, queryParams, saveHistory);
            }

            Ladda.stopAll();
        }
    },

    getErrorMessage: function (err, result) {
        let errorMessage;
        if (err) {
            errorMessage = err.message;
        } else if (result && result.error && result.error.message) {
            errorMessage = result.error.message;
        }
        else if (result && result.error) {
            errorMessage = JSON.stringify(result.error);
        }
        return errorMessage;
    },

    showMeteorFuncError  (err, result, message) {
        let errorMessage = this.getErrorMessage(err, result);
        if (errorMessage) {
            toastr.error(message + ": " + errorMessage);
        } else {
            toastr.error(message + ": unknown reason");
        }


        Ladda.stopAll();
    },

    sortObjectByKey  (obj) {
        const keys = [];
        const sorted_obj = {};

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        keys.sort();
        jQuery.each(keys, function (i, key) {
            sorted_obj[key] = obj[key];
        });

        return sorted_obj;
    },

    convertAndCheckJSON  (json) {
        if (!json) return {};
        json = json.match(/[^\s"']+|"([^"]*)"|'([^']*)'/gm).join('');
        let result = {};
        try {
            if (!json.startsWith('{') && !json.startsWith('[')) {
                json = '{' + json;
            }

            if ((!json.endsWith('}') && !json.endsWith(']')) ||
                (json.split('\{').length - 1) > (json.split('\}').length - 1)) {
                json = json + '}';
            }

            json = convertToExtendedJson(json);
            result = fbbkJson.parse(json);
        }
        catch (err) {
            result["ERROR"] = err.message;
        }

        return result;
    },

    checkCodeMirrorSelectorForOption  (option, result, optionEnum) {
        if ($.inArray(option, Session.get(this.strSessionSelectedOptions)) !== -1) {
            checkOption(getSelectorValue(), result, optionEnum, option);
        }
    },

    checkAndAddOption  (option, divSelector, result, optionEnum) {
        if ($.inArray(option, Session.get(this.strSessionSelectedOptions)) !== -1) {
            checkOption(this.getCodeMirrorValue(divSelector), result, optionEnum, option);
        }
    },

    setOptionsComboboxChangeEvent (cmb, sessionVar) {
        cmb.on('change', (evt, params) => {
            const array = Session.get(sessionVar || this.strSessionSelectedOptions);
            if (params.deselected) {
                array.remove(params.deselected);
            }
            else {
                array.push(params.selected);
            }
            Session.set(sessionVar || this.strSessionSelectedOptions, array);
        });
    },

    getParentTemplateName  (levels) {
        let view = Blaze.currentView;
        if (typeof levels === "undefined") {
            levels = 1;
        }
        while (view) {
            if (view.name.indexOf("Template.") !== -1 && !(levels--)) {
                return view.name.substring(view.name.indexOf('.') + 1);
            }
            view = view.parentView;
        }
    },

    changeRunOnAdminOptionVisibility  (show) {
        if (show) {
            $('#aRunOnAdminDB').show();
        } else {
            $('#aRunOnAdminDB').hide();
        }

    },

    getDistinctKeysForAutoComplete  (selectedCollection) {
        const settings = Settings.findOne();
        let countToTake = isNaN(parseInt(settings.autoCompleteSamplesCount)) ? 50 : parseInt(settings.autoCompleteSamplesCount);
        if (selectedCollection.endsWith('.chunks') || countToTake <= 0) {
            Session.set(this.strSessionDistinctFields, []);
            // ignore chunks
            return;
        }

        Meteor.call("count", selectedCollection, {}, {}, Meteor.default_connection._lastSessionId, (err, result) => {
            if (err || result.error) {
                this.showMeteorFuncError(err, result, "Couldn't fetch distinct fields");
                Ladda.stopAll();
            }
            else {
                const count = result.result;
                Meteor.call("find", selectedCollection, {}, {
                    limit: countToTake,
                    skip: Math.random() * count
                }, false, Meteor.default_connection._lastSessionId, (err, samples) => {
                    if (err || samples.error) {
                        this.showMeteorFuncError(err, samples, "Couldn't fetch distinct fields");
                    }
                    else {
                        const keys = this.findKeysOfObject(samples.result);
                        Session.set(this.strSessionDistinctFields, keys);
                    }

                    Ladda.stopAll();
                });
            }
        });


    },

    findKeysOfObject (resultArray){
        let result = [];

        for (let object of resultArray) {
            const keys = Object.keys(object);
            for (let key of keys) {
                if (result.indexOf(key) === -1) result.push(key);
            }
        }

        return result;
    },

    doCodeMirrorResizable(codeMirror){
        $('.CodeMirror').resizable({
            resize: function () {
                codeMirror.setSize($(this).width(), $(this).height());
            }
        });
    },

    initializeCodeMirror  (divSelector, txtAreaId, keepValue, height = 100, noResize) {
        const autoCompleteShortcut = Settings.findOne().autoCompleteShortcut || "Ctrl-Space";
        let codeMirror;
        let extraKeys = {
            "Ctrl-Q": function (cm) {
                cm.foldCode(cm.getCursor());
            }
        };
        extraKeys[autoCompleteShortcut] = "autocomplete";

        if (!divSelector.data('editor')) {
            codeMirror = CodeMirror.fromTextArea(document.getElementById(txtAreaId), {
                mode: "javascript",
                theme: "neat",
                styleActiveLine: true,
                lineNumbers: true,
                lineWrapping: false,
                extraKeys: extraKeys,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
            });

            if (keepValue) {
                codeMirror.on("change", () => {
                    Session.set(this.strSessionSelectorValue, codeMirror.getValue());
                });
            }

            codeMirror.setSize('%100', height);

            CodeMirror.hint.javascript = (editor) => {
                const list = Session.get(this.strSessionDistinctFields) || [];
                const cursor = editor.getCursor();
                const currentLine = editor.getLine(cursor.line);
                let start = cursor.ch;
                let end = start;
                while (end < currentLine.length && /[\w.$]+/.test(currentLine.charAt(end))) ++end;
                while (start && /[\w.$]+/.test(currentLine.charAt(start - 1))) --start;
                let curWord = start != end && currentLine.slice(start, end);
                const regex = new RegExp('^' + curWord, 'i');
                return {
                    list: (!curWord ? list : list.filter(function (item) {
                            return item.match(regex);
                        })).sort(),
                    from: CodeMirror.Pos(cursor.line, start),
                    to: CodeMirror.Pos(cursor.line, end)
                };
            };

            divSelector.data('editor', codeMirror);

            if (!noResize) this.doCodeMirrorResizable(codeMirror);
        }
        else {
            codeMirror = divSelector.data('editor');
        }

        if (keepValue && Session.get(this.strSessionSelectorValue)) {
            codeMirror.setValue(Session.get(this.strSessionSelectorValue));
        }

        codeMirror.refresh();
    },

    setCodeMirrorValue (divSelector, val, txtSelector) {
        if (divSelector.data('editor')) {
            divSelector.data('editor').setValue(val);
        } else if (txtSelector) {
            txtSelector.val(val);
        }
    },

    getCodeMirrorValue (divSelector) {
        if (divSelector.data('editor')) {
            return divSelector.data('editor').getValue();
        }
        return "";
    }
};

const helper = new Helper();
export default helper;

(function () {
    Array.prototype.remove = function () {
        let what;
        const a = arguments;
        let L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    String.prototype.parseFunction = function () {
        const funcReg = /function *\(([^()]*)\)[ \n\t]*\{(.*)}/gmi;
        const match = funcReg.exec(this.replace(/\n/g, ' '));
        if (match) {
            return new Function(match[1].split(','), match[2]);
        }

        return null;
    };

    Template.registerHelper('getConfiguredAutoCompletionKey', function () {
        return Settings.findOne().autoCompleteShortcut || "Ctrl-Space";
    });

    Template.registerHelper('isOptionSelected', function (option, sessionVar) {
        if (!sessionVar || Object.prototype.toString.call(sessionVar) !== '[object String]') return $.inArray(option, Session.get(helper.strSessionSelectedOptions)) !== -1;

        return $.inArray(option, Session.get(sessionVar)) !== -1;
    });

    Template.registerHelper('getConnection', function () {
        if (Session.get(helper.strSessionConnection)) {
            return Connections.findOne({_id: Session.get(helper.strSessionConnection)});
        }
    });

    Template.registerHelper('getSelectedCollection', function () {
        return Session.get(helper.strSessionSelectedCollection);
    });

    Template.registerHelper('isConnected', function () {
        return (Session.get(helper.strSessionCollectionNames) != undefined);
    });

})();
