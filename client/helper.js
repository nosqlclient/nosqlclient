/**
 * Created by RSercan on 26.12.2015.
 */
Template.strSessionConnection = 'connection';
Template.strSessionCollectionNames = 'collectionNames';
Template.strSessionSelectedCollection = 'selectedCollection';
Template.strSessionSelectedQuery = 'selectedQuery';
Template.strSessionSelectedOptions = "selectedOptions";
Template.strSessionServerStatus = "serverStatus";
Template.strSessionDBStats = "dbStats";

Template.clearSessions = function () {
    Session.set(Template.strSessionCollectionNames, undefined);
    Session.set(Template.strSessionConnection, undefined);
    Session.set(Template.strSessionSelectedCollection, undefined);
    Session.set(Template.strSessionSelectedQuery, undefined);
    Session.set(Template.strSessionSelectedOptions, undefined);
    Session.set(Template.strSessionServerStatus, undefined);
    Session.set(Template.strSessionDBStats, undefined);
};

Template.renderAfterQueryExecution = function (err, result) {
    if (err || result.error) {
        var errorMessage;
        if (err) {
            errorMessage = err.message;
        } else {
            errorMessage = result.error.message;
        }
        if (errorMessage) {
            toastr.error("Couldn't execute query: " + errorMessage);
        } else {
            toastr.error("Couldn't execute query, unknown reason ");
        }
    } else {
        Template.browseCollection.setResult(result.result);
    }

    // stop loading animation
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