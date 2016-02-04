/**
 * Created by sercan on 30.12.2015.
 */
Template.find.onRendered(function () {
    Template.find.initializeOptions();
});

Template.find.initializeOptions = function () {
    var cmb = $('#cmbFindCursorOptions');
    $.each(Template.sortObjectByKey(CURSOR_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.find.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var cursorOptions = Template.cursorOptions.getCursorOptions();
    var selector = ace.edit("aceSelector").getSession().getValue();
    var maxAllowedFetchSize = Math.round(Settings.findOne().maxAllowedFetchSize * 100) / 100;

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    if (cursorOptions["ERROR"]) {
        toastr.error(cursorOptions["ERROR"]);
        Ladda.stopAll();
        return;
    }


    // max allowed fetch size  != 0 and there's no project option, check for size
    if (maxAllowedFetchSize && maxAllowedFetchSize != 0 && !(CURSOR_OPTIONS.PROJECT in cursorOptions)) {
        // get stats to calculate fetched documents size from avgObjSize (stats could be changed, therefore we can't get it from html )
        Meteor.call("stats", connection, selectedCollection, {}, function (statsError, statsResult) {
            if (statsError || statsResult.error || !(statsResult.result.avgObjSize)) {
                // if there's an error, nothing we can do
                Template.find.proceedFindQuery(connection, selectedCollection, selector, cursorOptions);
            }
            else {
                if (CURSOR_OPTIONS.LIMIT in cursorOptions) {
                    var count = cursorOptions.limit;
                    if (Template.find.checkAverageSize(count, statsResult.result.avgObjSize, maxAllowedFetchSize)) {
                        Template.find.proceedFindQuery(connection, selectedCollection, selector, cursorOptions);
                    }
                }
                else {
                    Meteor.call("count", connection, selectedCollection, selector, function (err, result) {
                        if (err || result.error) {
                            Template.find.proceedFindQuery(connection, selectedCollection, selector, cursorOptions);
                        }
                        else {
                            var count = result.result;
                            if (Template.find.checkAverageSize(count, statsResult.result.avgObjSize, maxAllowedFetchSize)) {
                                Template.find.proceedFindQuery(connection, selectedCollection, selector, cursorOptions);
                            }
                        }
                    });
                }
            }
        });
    }
    else {
        Template.find.proceedFindQuery(connection, selectedCollection, selector, cursorOptions);
    }
};

Template.find.proceedFindQuery = function (connection, selectedCollection, selector, cursorOptions) {
    Meteor.call("find", connection, selectedCollection, selector, cursorOptions, function (err, result) {
        Template.renderAfterQueryExecution(err, result, "find");
    });
};

Template.find.checkAverageSize = function (count, avgObjSize, maxAllowedFetchSize) {
    var totalBytes = (count * avgObjSize) / (1024 * 1024);
    var totalMegabytes = Math.round(totalBytes * 100) / 100;

    if (totalMegabytes > maxAllowedFetchSize) {
        Ladda.stopAll();
        toastr.error("The fetched document size (average): " + totalMegabytes + " MB, exceeds maximum allowed size (" + maxAllowedFetchSize + " MB), please use LIMIT, SKIP options.");
        return false;
    }

    return true;
};
