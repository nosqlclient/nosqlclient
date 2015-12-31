/**
 * Created by sercan on 30.12.2015.
 */
Template.find.onRendered(function () {
    // set ace editor
    Template.find.initializeAceEditor();
    Template.find.initializeOptions();
    Template.find.initializeSessionVariable();
});

//TODO change this
Template.browseCollection.events({
    'click #btnExecuteQuery': function (e) {
        Template.find.executeQuery();
    }
});


Template.find.initializeAceEditor = function () {
    AceEditor.instance("preSelector", {
        mode: "javascript",
        theme: 'dawn'
    }, function (editor) {
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            fontSize: "11pt",
            showPrintMargin: false,
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
        editor.commands.bindKey("Enter|Shift-Enter", Template.find.executeQuery);
    });
}

Template.find.initializeOptions = function () {
    var cmb = $('#cmbCursorOptions');
    $.each(CURSOR_OPTIONS, function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
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
}

Template.find.initializeSessionVariable = function () {
    Session.set(Template.strSessionSelectedOptions, []);
}

Template.find.executeQuery = function () {
    // hide results
    $('#divJsonEditor').hide();
    $('#divAceEditor').hide();

    // loading button
    var l = $('#btnExecuteQuery').ladda();
    l.ladda('start');

    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var cursorOptions = Template.find.getCursorOptions();
    var selector = ace.edit("preSelector").getSession().getValue();

    if (!selector) {
        selector = {};
    }
    else {
        try {
            selector = JSON.parse(selector);
        }
        catch (err) {
            toastr.error("Syntax error on selector: " + err.message);
            l.ladda('stop');
            return;
        }
    }

    if (cursorOptions["ERROR"]) {
        toastr.error(cursorOptions["ERROR"]);
        l.ladda('stop');
        return;
    }

    Meteor.call('executeFindQuery', connection, selectedCollection, selector, cursorOptions, function (err, result) {
        if (err || result.error) {
            var errorMessage;
            if (err) {
                errorMessage = err.message;
            } else {
                errorMessage = result.error.message;
            }
            toastr.error("Couldn't execute query: " + errorMessage);
            // stop loading animation
            l.ladda('stop');
            return;
        }

        // set json editor
        Template.find.getEditor().set(result.result);

        // set ace editor
        AceEditor.instance("aceeditor", {
            mode: "javascript",
            theme: 'dawn'
        }, function (editor) {
            editor.$blockScrolling = Infinity;
            editor.setOptions({
                fontSize: "12pt",
                showPrintMargin: false
            });
            editor.setValue(JSON.stringify(result.result, null, '\t'), -1);
        });

        $('#divJsonEditor').show('slow');

        // stop loading animation
        l.ladda('stop');
    });
}

Template.find.getCursorOptions = function () {
    var result = {};
    if ($.inArray("PROJECT", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var val = ace.edit("aceProject").getSession().getValue();
        if (!val) {
            val = {};
        }
        else {
            try {
                val = JSON.parse(val);
            }
            catch (err) {
                result["ERROR"] = "Syntax Error on $project: " + err.message;
                return result;
            }
        }
        result[CURSOR_OPTIONS.PROJECT] = val;
    }

    if ($.inArray("SKIP", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var val = $('#inputSkip').val();
        if (val) {
            result[CURSOR_OPTIONS.SKIP] = parseInt(val);
        }
    }

    if ($.inArray("LIMIT", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var val = $('#inputLimit').val();
        if (val) {
            result[CURSOR_OPTIONS.LIMIT] = parseInt(val);
        }
    }

    if ($.inArray("MAX", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var val = ace.edit("aceMax").getSession().getValue();
        if (!val) {
            val = {};
        }
        else {
            try {
                val = JSON.parse(val);
            }
            catch (err) {
                result["ERROR"] = "Syntax Error on $max: " + err.message;
                return result;
            }
        }
        result[CURSOR_OPTIONS.MAX] = val;
    }

    if ($.inArray("MIN", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var val = ace.edit("aceMin").getSession().getValue();
        if (!val) {
            val = {};
        }
        else {
            try {
                val = JSON.parse(val);
            }
            catch (err) {
                result["ERROR"] = "Syntax Error on $min: " + err.message;
                return result;
            }
        }
        result[CURSOR_OPTIONS.MIN] = val;
    }

    if ($.inArray("SORT", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var val = ace.edit("aceSort").getSession().getValue();
        if (!val) {
            val = {};
        }
        else {
            try {
                val = JSON.parse(val);
            }
            catch (err) {
                result["ERROR"] = "Syntax Error on $sort: " + err.message;
                return result;
            }
        }
        result[CURSOR_OPTIONS.SORT] = val;
    }

    return result;
}

var jsonEditor;
Template.find.getEditor = function () {
    if ($('.jsoneditor').length == 0) {
        jsonEditor = new JSONEditor(document.getElementById("jsoneditor"), {
            mode: "tree",
            search: true
        });
    }
    return jsonEditor;
}