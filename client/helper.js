/**
 * Created by RSercan on 26.12.2015.
 */
Template.strSessionConnection = "connection";
Template.strSessionCollectionNames = "collectionNames";
Template.strSessionSelectedCollection = "selectedCollection";
Template.strSessionSelectedQuery = "selectedQuery";
Template.strSessionSelectedOptions = "selectedOptions";
Template.strSessionServerStatus = "serverStatus";
Template.strSessionDBStats = "dbStats";
Template.strSessionUsedTabIDs = "usedTabIDs";
Template.strSessionActiveTabID = "activeTabID";
Template.strSessionSelectedDump = "selectedDump";
Template.strSessionSelectedFile = "selectedFile";
Template.strSessionEasyEditID = "easyEditID";
Template.strSessionDistinctFields = "distinctFields";
Template.strSessionSelectedQueryHistory = "selectedQueryHistory";
Template.strSessionSelectorValue = "selectorValue";
Template.strSessionSelectionUserManagement = "userManagementValue";
Template.strSessionUsermanagementInfo = "userManagementInfo";
Template.strSessionUsermanagementManageSelection = "userManagementManageSelection";
Template.strSessionUsermanagementUser = "userManagementUser";
Template.strSessionUsermanagementRole = "userManagementRole";
Template.strSessionUsermanagementPrivilege = "userManagementPrivilege";

Template.clearSessions = function () {
    Object.keys(Session.keys).forEach(function (key) {
        Session.set(key, undefined);
    })
};

Template.initiateDatatable = function (selector, sessionKey, noDeleteEvent) {
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
};

Template.renderAfterQueryExecution = function (err, result, isAdmin, queryInfo, queryParams, saveHistory) {
    if (err || result.error) {
        Template.showMeteorFuncError(err, result, "Couldn't execute query");
    }
    else {
        if (isAdmin) {
            Template.adminQueries.setResult(result.result);
        } else {
            Template.browseCollection.setResult(result.result, queryInfo, queryParams, saveHistory);
        }
        Ladda.stopAll();
    }

};

Template.showMeteorFuncError = function (err, result, message) {
    var errorMessage;
    if (err) {
        errorMessage = err.message;
    } else {
        errorMessage = result.error.message;
    }
    if (errorMessage) {
        toastr.error(message + ": " + errorMessage);
    } else {
        toastr.error(message);
    }

    Ladda.stopAll();
};

Template.sortObjectByKey = function (obj) {
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
};

Template.convertAndCheckJSON = function (json) {
    if (json == "") return {};
    var result = {};
    try {
        result = JSON.parse(json);
    }
    catch (err) {
        result["ERROR"] = err.message;
    }

    return result;
};

Template.checkCodeMirrorSelectorForOption = function (option, result, optionEnum) {
    if ($.inArray(option, Session.get(Template.strSessionSelectedOptions)) != -1) {
        var val = Template.selector.getValue();

        if (val == "") result[optionEnum[option]] = {};
        else {
            try {
                val = JSON.parse(val);
                result[optionEnum[option]] = val;
            }
            catch (err) {
                result["ERROR"] = "Syntax Error on " + optionEnum[option] + ": " + err.message;
            }
        }
    }
};

Template.checkAceEditorOption = function (option, editorId, result, optionEnum) {
    if ($.inArray(option, Session.get(Template.strSessionSelectedOptions)) != -1) {
        var val = ace.edit(editorId).getSession().getValue();

        if (val == "") result[optionEnum[option]] = {};
        else {
            try {
                val = JSON.parse(val);
                result[optionEnum[option]] = val;
            }
            catch (err) {
                result["ERROR"] = "Syntax Error on " + optionEnum[option] + ": " + err.message;
            }
        }
    }
};

Template.setOptionsComboboxChangeEvent = function (cmb) {
    cmb.on('change', function (evt, params) {
        var array = Session.get(Template.strSessionSelectedOptions);
        if (params.deselected) {
            array.remove(params.deselected);
        }
        else {
            array.push(params.selected);
        }
        Session.set(Template.strSessionSelectedOptions, array);
    });
};

Template.getParentTemplateName = function (levels) {
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
};

Template.changeRunOnAdminOptionVisibility = function (show) {
    if (show) {
        $('#aRunOnAdminDB').show();
    } else {
        $('#aRunOnAdminDB').hide();
    }

};
Template.changeConvertOptionsVisibility = function (show) {
    if (show) {
        $('#aConvertIsoDates').show();
        $('#aConvertObjectIds').show();
    } else {
        $('#aConvertIsoDates').hide();
        $('#aConvertObjectIds').hide();
    }
};

Template.getDistinctKeysForAutoComplete = function (selectedCollection) {
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

    Meteor.call("mapReduce", selectedCollection, mapFunc, reduceFunc, options, function (err, result) {
        if (err || result.error) {
            Template.showMeteorFuncError(err, result, "Couldn't fetch distinct fields for autocomplete");
        }
        else {
            var nameArray = [];
            result.result.forEach(function (entry) {
                nameArray.push(entry._id);
            });
            Session.set(Template.strSessionDistinctFields, nameArray);
            Ladda.stopAll();
        }

    });
};

Template.initializeAceEditor = function (id, evt) {
    Tracker.autorun(function (e) {
        var editor = AceEditor.instance(id, {
            mode: "javascript",
            theme: 'dawn'
        });
        if (editor.loaded !== undefined) {
            e.stop();
            editor.$blockScrolling = Infinity;
            editor.setOptions({
                fontSize: "11pt",
                showPrintMargin: false
            });

            // remove newlines in pasted text
            editor.on("paste", function (e) {
                e.text = e.text.replace(/[\r\n]+/g, " ");
            });
            // make mouse position clipping nicer
            editor.renderer.screenToTextCoordinates = function (x, y) {
                var pos = this.pixelToScreenCoordinates(x, y);
                return this.session.screenToDocumentPosition(
                    Math.min(this.session.getScreenLength() - 1, Math.max(pos.row, 0)),
                    Math.max(pos.column, 0)
                );
            };
            // disable Enter Shift-Enter keys
            editor.commands.bindKey("Enter|Shift-Enter", evt);
        }
    });
};

Template.registerHelper('isOptionSelected', function (option) {
    return $.inArray(option, Session.get(Template.strSessionSelectedOptions)) != -1;
});

Template.registerHelper('getConnection', function () {
    if (Session.get(Template.strSessionConnection)) {
        return Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    }
});

Template.registerHelper('getSelectedCollection', function () {
    return Session.get(Template.strSessionSelectedCollection);
});

Template.registerHelper('isConnected', function () {
    return (Session.get(Template.strSessionCollectionNames) != undefined);
});

/**
 * Adds remove by value functionality to arrays. e.x. myArray.remove('myValue');
 * */
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

/**
 * JS functions can be generated from strings.
 * */
String.prototype.parseFunction = function () {
    var funcReg = /function *\(([^()]*)\)[ \n\t]*{(.*)}/gmi;
    var match = funcReg.exec(this.replace(/\n/g, ' '));
    if (match) {
        return new Function(match[1].split(','), match[2]);
    }

    return null;
};