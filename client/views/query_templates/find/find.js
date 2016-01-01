/**
 * Created by sercan on 30.12.2015.
 */
Template.find.onRendered(function () {
    // set ace editor
    Template.find.initializeAceEditor();
    Template.find.initializeOptions();
    Template.find.initializeSessionVariable();
});

Template.find.initializeAceEditor = function () {
    AceEditor.instance("preSelector", {
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
        editor.commands.bindKey("Enter|Shift-Enter", Template.find.executeQuery);
    });
};

Template.find.initializeOptions = function () {
    var cmb = $('#cmbCursorOptions');
    $.each(CURSOR_OPTIONS, function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.find.setCursorOptionsChangeEvent(cmb);
};

Template.find.setCursorOptionsChangeEvent = function (cmb) {
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

Template.find.initializeSessionVariable = function () {
    Session.set(Template.strSessionSelectedOptions, []);
};

Template.find.executeQuery = function (methodName) {
    var laddaButton = Template.browseCollection.initExecuteQuery();
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
            laddaButton.ladda('stop');
            return;
        }
    }

    if (cursorOptions["ERROR"]) {
        toastr.error(cursorOptions["ERROR"]);
        laddaButton.ladda('stop');
        return;
    }

    Meteor.call((methodName ? methodName : "find"), connection, selectedCollection, selector, cursorOptions, function (err, result) {
        if (err || result.error) {
            var errorMessage;
            if (err) {
                errorMessage = err.message;
            } else {
                errorMessage = result.error.message;
            }
            toastr.error("Couldn't execute query: " + errorMessage);
            // stop loading animation
            laddaButton.ladda('stop');
            return;
        }

        Template.browseCollection.setResult(result.result);
        // stop loading animation
        laddaButton.ladda('stop');
    });
};

Template.find.getCursorOptions = function () {
    var result = {};
    if ($.inArray("PROJECT", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var projectVal = ace.edit("aceProject").getSession().getValue();
        if (!projectVal) {
            projectVal = {};
        }
        else {
            try {
                projectVal = JSON.parse(projectVal);
            }
            catch (err) {
                result["ERROR"] = "Syntax Error on $project: " + err.message;
                return result;
            }
        }
        result[CURSOR_OPTIONS.PROJECT] = projectVal;
    }

    if ($.inArray("SKIP", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var skipVal = $('#inputSkip').val();
        if (skipVal) {
            result[CURSOR_OPTIONS.SKIP] = parseInt(skipVal);
        }
    }

    if ($.inArray("LIMIT", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var limitVal = $('#inputLimit').val();
        if (limitVal) {
            result[CURSOR_OPTIONS.LIMIT] = parseInt(limitVal);
        }
    }

    if ($.inArray("MAX", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var maxVal = ace.edit("aceMax").getSession().getValue();
        if (!maxVal) {
            maxVal = {};
        }
        else {
            try {
                maxVal = JSON.parse(maxVal);
            }
            catch (err) {
                result["ERROR"] = "Syntax Error on $max: " + err.message;
                return result;
            }
        }
        result[CURSOR_OPTIONS.MAX] = maxVal;
    }

    if ($.inArray("MIN", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var minVal = ace.edit("aceMin").getSession().getValue();
        if (!minVal) {
            minVal = {};
        }
        else {
            try {
                minVal = JSON.parse(minVal);
            }
            catch (err) {
                result["ERROR"] = "Syntax Error on $min: " + err.message;
                return result;
            }
        }
        result[CURSOR_OPTIONS.MIN] = minVal;
    }

    if ($.inArray("SORT", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var sortVal = ace.edit("aceSort").getSession().getValue();
        if (!sortVal) {
            sortVal = {};
        }
        else {
            try {
                sortVal = JSON.parse(sortVal);
            }
            catch (err) {
                result["ERROR"] = "Syntax Error on $sort: " + err.message;
                return result;
            }
        }
        result[CURSOR_OPTIONS.SORT] = sortVal;
    }

    return result;
};