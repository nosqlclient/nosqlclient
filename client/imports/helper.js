/**
 * Created by RSercan on 26.12.2015.
 */
(function () {
    import {Template} from 'meteor/templating';
    import {Session} from 'meteor/session';
    import {Meteor} from 'meteor/meteor';
    import {Connections} from '/lib/imports/collections/connections';
    import {Settings} from '/lib/imports/collections/settings';
    import {setAdminResult} from '/client/imports/views/pages/admin_queries/admin_queries';
    import {setQueryResult} from '/client/imports/views/pages/browse_collection/browse_collection';
    import {getSelectorValue} from '/client/imports/views/query_templates_common/selector/selector';

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

    Array.prototype.remove = function () {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    String.prototype.parseFunction = function () {
        var funcReg = /function *\(([^()]*)\)[ \n\t]*{(.*)}/gmi;
        var match = funcReg.exec(this.replace(/\n/g, ' '));
        if (match) {
            return new Function(match[1].split(','), match[2]);
        }

        return null;
    };

    const extractMiddleString = function (str) {
        if (!str) {
            return "";
        }

        return str.substring(str.indexOf("\"") + 1, str.lastIndexOf("\""));
    };

    const getPosition = function (str, searchText, indice) {
        return str.split(searchText, indice).join(searchText).length;
    };

    const replaceRegex = function (str) {
        var firstIndex = getPosition(str, '/', 1);
        var secondIndex = getPosition(str, '/', 2);
        var options = str.substr(secondIndex + 1, 4);
        secondIndex += options.length;
        var regex = "{$regex:\"" + str.substring(firstIndex + 1, secondIndex + 1) + "\"";
        regex += options ? ",$options:\"+options+\"}" : "}";

        return str.replace(str.substring(firstIndex, secondIndex + 1), regex);
    };

    //supporting shell commands for ObjectID and ISODate, https://docs.mongodb.com/manual/reference/mongodb-extended-json/
    const convertToExtendedJson = function (str) {
        if (!str || Object.prototype.toString.call(str) !== '[object String]') {
            return;
        }

        // support shell stuff

        // replace objectID variations with $oid
        let objectIDRegex = /objectid\("[A-Z0-9]*"\)/gmi;
        let objIdMatches = str.match(objectIDRegex);

        if (objIdMatches) {
            for (let i = 0; i < objIdMatches.length; i++) {
                str = str.replace(objIdMatches[i], "{$oid:\"" + extractMiddleString(objIdMatches[i]) + "\"}");
            }
        }

        // replace ISODate|date variations with $date
        let isoDateRegex = /isodate\("[A-Z0-9-:.]*"\)|date\("[A-Z0-9-:.]*"\)|newdate\("[A-Z0-9-:.]*"\)|newisodate\("[A-Z0-9-:.]*"\)/gmi;
        let isoDateMatches = str.match(isoDateRegex);

        if (isoDateMatches) {
            for (let i = 0; i < isoDateMatches.length; i++) {
                str = str.replace(isoDateMatches[i], "{$date:\"" + extractMiddleString(isoDateMatches[i]) + "\"}");
            }
        }

        return str;
    };


    let Helper = function () {
        this.strSessionConnection = "connection";
        this.strSessionCollectionNames = "collectionNames";
        this.strSessionSelectedCollection = "selectedCollection";
        this.strSessionSelectedQuery = "selectedQuery";
        this.strSessionSelectedOptions = "selectedOptions";
        this.strSessionServerStatus = "serverStatus";
        this.strSessionDBStats = "dbStats";
        this.strSessionUsedTabIDs = "usedTabIDs";
        this.strSessionSelectedDump = "selectedDump";
        this.strSessionSelectedFile = "selectedFile";
        this.strSessionEasyEditID = "easyEditID";
        this.strSessionDistinctFields = "distinctFields";
        this.strSessionSelectedQueryHistory = "selectedQueryHistory";
        this.strSessionSelectorValue = "selectorValue";
        this.strSessionSelectionUserManagement = "userManagementValue";
        this.strSessionUsermanagementInfo = "userManagementInfo";
        this.strSessionUsermanagementManageSelection = "userManagementManageSelection";
        this.strSessionUsermanagementUser = "userManagementUser";
        this.strSessionUsermanagementRole = "userManagementRole";
        this.strSessionUsermanagementPrivilege = "userManagementPrivilege";
    };

    Helper.prototype = {
        clearSessions () {
            Object.keys(Session.keys).forEach(function (key) {
                Session.set(key, undefined);
            })
        },

        initiateDatatable (selector, sessionKey, noDeleteEvent) {
            selector.find('tbody').on('click', 'tr', function () {
                var table = selector.DataTable();
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
                selector.find('tbody').on('click', 'a.editor_delete', function () {
                    selector.DataTable().row($(this).parents('tr')).remove().draw();
                });
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

        showMeteorFuncError  (err, result, message) {
            var errorMessage;
            if (err) {
                errorMessage = err.message;
            } else if (result.error.message) {
                errorMessage = result.error.message;
            }
            else if (result.error) {
                errorMessage = JSON.stringify(result.error);
            }
            if (errorMessage) {
                toastr.error(message + ": " + errorMessage);
            } else {
                toastr.error(message + ": unknown reason");
            }


            Ladda.stopAll();
        },

        sortObjectByKey  (obj) {
            var keys = [];
            var sorted_obj = {};

            for (var key in obj) {
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
            json = json.replace(/\s/g, '');
            var result = {};
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
            if ($.inArray(option, Session.get(this.strSessionSelectedOptions)) != -1) {
                var val = getSelectorValue();

                if (val == "") result[optionEnum[option]] = {};
                else {
                    try {
                        val = fbbkJson.parse(val);
                        result[optionEnum[option]] = val;
                    }
                    catch (err) {
                        result["ERROR"] = "Syntax Error on " + optionEnum[option] + ": " + err.message;
                    }
                }
            }
        },

        checkAndAddOption  (option, divSelector, result, optionEnum) {
            if ($.inArray(option, Session.get(this.strSessionSelectedOptions)) != -1) {
                var val = this.getCodeMirrorValue(divSelector);

                if (val == "") result[optionEnum[option]] = {};
                else {
                    try {
                        val = fbbkJson.parse(val);
                        result[optionEnum[option]] = val;
                    }
                    catch (err) {
                        result["ERROR"] = "Syntax Error on " + optionEnum[option] + ": " + err.message;
                    }
                }
            }
        },

        setOptionsComboboxChangeEvent (cmb) {
            cmb.on('change', (evt, params) => {
                var array = Session.get(this.strSessionSelectedOptions);
                if (params.deselected) {
                    array.remove(params.deselected);
                }
                else {
                    array.push(params.selected);
                }
                Session.set(this.strSessionSelectedOptions, array);
            });
        },

        getParentTemplateName  (levels) {
            var view = Blaze.currentView;
            if (typeof levels === "undefined") {
                levels = 1;
            }
            while (view) {
                if (view.name.indexOf("Template.") != -1 && !(levels--)) {
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
            var settings = Settings.findOne();
            if (!settings.autoCompleteFields) {
                return;
            }
            if (selectedCollection.endsWith('.chunks')) {
                // ignore chunks
                return;
            }

            var mapFunc = "function () {for (var key in this) {emit(key, null);}};";
            var reduceFunc = "function (key, stuff) {return null;};";
            var options = {
                out: {inline: 1}
            };

            Meteor.call("mapReduce", selectedCollection, mapFunc, reduceFunc, options, (err, result) => {
                if (err || result.error) {
                    this.showMeteorFuncError(err, result, "Couldn't fetch distinct fields for autocomplete");
                }
                else {
                    var nameArray = [];
                    result.result.forEach(function (entry) {
                        nameArray.push(entry._id);
                    });
                    Session.set(this.strSessionDistinctFields, nameArray);

                    Ladda.stopAll();
                }

            });
        },

        initializeCodeMirror  (divSelector, txtAreaId, keepValue) {
            var codeMirror;
            if (!divSelector.data('editor')) {
                codeMirror = CodeMirror.fromTextArea(document.getElementById(txtAreaId), {
                    mode: "javascript",
                    theme: "neat",
                    styleActiveLine: true,
                    lineNumbers: true,
                    lineWrapping: false,
                    extraKeys: {
                        "Ctrl-Q": function (cm) {
                            cm.foldCode(cm.getCursor());
                        },
                        "Ctrl-Space": "autocomplete"
                    },
                    foldGutter: true,
                    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
                });


                if (keepValue) {
                    codeMirror.on("change", () => {
                        Session.set(this.strSessionSelectorValue, codeMirror.getValue());
                    });
                }

                codeMirror.setSize('%100', 100);

                CodeMirror.hint.javascript = (editor)=> {
                    var list = Session.get(this.strSessionDistinctFields) || [];
                    var cursor = editor.getCursor();
                    var currentLine = editor.getLine(cursor.line);
                    var start = cursor.ch;
                    var end = start;
                    while (end < currentLine.length && /[\w$]+/.test(currentLine.charAt(end))) ++end;
                    while (start && /[\w$]+/.test(currentLine.charAt(start - 1))) --start;
                    var curWord = start != end && currentLine.slice(start, end);
                    var regex = new RegExp('^' + curWord, 'i');
                    return {
                        list: (!curWord ? list : list.filter(function (item) {
                            return item.match(regex);
                        })).sort(),
                        from: CodeMirror.Pos(cursor.line, start),
                        to: CodeMirror.Pos(cursor.line, end)
                    };
                };

                divSelector.data('editor', codeMirror);

                $('.CodeMirror').resizable({
                    resize: function () {
                        codeMirror.setSize($(this).width(), $(this).height());
                    }
                });
            }
            else {
                codeMirror = divSelector.data('editor');
            }

            if (keepValue && Session.get(this.strSessionSelectorValue)) {
                codeMirror.setValue(Session.get(this.strSessionSelectorValue));
            }
        },

        setCodeMirrorValue (divSelector, val) {
            if (divSelector.data('editor')) {
                divSelector.data('editor').setValue(val);
            }
        },

        getCodeMirrorValue (divSelector) {
            if (divSelector.data('editor')) {
                return divSelector.data('editor').getValue();
            }
            throw 'Unexpected state, codemirror could not be found';
        }
    };

    let helper = new Helper();

    Template.registerHelper('isOptionSelected', function (option) {
        return $.inArray(option, Session.get(helper.strSessionSelectedOptions)) != -1;
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

    export default helper;

})();
