/**
 * Created by RSercan on 26.12.2015.
 */
Template.strSessionConnection = 'connection';
Template.strSessionCollectionNames = 'collectionNames';
Template.strSessionSelectedCollection = 'selectedCollection';
Template.strSessionSelectedQuery = 'selectedQuery';
Template.strSessionSelectedOptions = "selectedOptions";

Template.clearSessions = function () {
    Session.set(Template.strSessionCollectionNames, undefined);
    Session.set(Template.strSessionConnection, undefined);
    Session.set(Template.strSessionSelectedCollection, undefined);
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
    AceEditor.instance(id, {
        mode: "javascript",
        theme: 'dawn'
    }, function (editor) {
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
    });
};

Template.registerHelper('isSelected', function (option) {
    return $.inArray(option, Session.get(Template.strSessionSelectedOptions)) != -1;
});

Template.registerHelper('getConnection', function () {
    if (Session.get(Template.strSessionConnection)) {
        return Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    }
});

Template.registerHelper('getCollectionNames', function () {
    return Session.get(Template.strSessionCollectionNames);
});

Template.registerHelper('getSelectedCollection', function () {
    return Session.get(Template.strSessionSelectedCollection);
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