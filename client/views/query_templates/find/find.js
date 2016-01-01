/**
 * Created by sercan on 30.12.2015.
 */
Template.find.onRendered(function () {
    Template.initializeAceEditor('preSelector', Template.find.executeQuery);
    Template.find.initializeOptions();
});


Template.find.initializeOptions = function () {
    var cmb = $('#cmbFindCursorOptions');
    $.each(CURSOR_OPTIONS, function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.find.executeQuery = function () {
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

    Meteor.call("find", connection, selectedCollection, selector, cursorOptions, function (err, result) {
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