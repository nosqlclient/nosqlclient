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

Template.find.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var maxAllowedFetchSize = Math.round(Settings.findOne().maxAllowedFetchSize * 100) / 100;
    var cursorOptions = historyParams ? historyParams.cursorOptions : Template.cursorOptions.getCursorOptions();
    var selector = historyParams ? JSON.stringify(historyParams.selector) : Template.selector.getValue();

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
                Template.find.proceedFindQuery(connection, selectedCollection, selector, cursorOptions, (historyParams ? false : true));
            }
            else {
                if (CURSOR_OPTIONS.LIMIT in cursorOptions) {
                    var count = cursorOptions.limit;
                    if (Template.find.checkAverageSize(count, statsResult.result.avgObjSize, maxAllowedFetchSize)) {
                        Template.find.proceedFindQuery(connection, selectedCollection, selector, cursorOptions, (historyParams ? false : true));
                    }
                }
                else {
                    Meteor.call("count", connection, selectedCollection, selector, function (err, result) {
                        if (err || result.error) {
                            Template.find.proceedFindQuery(connection, selectedCollection, selector, cursorOptions, (historyParams ? false : true));
                        }
                        else {
                            var count = result.result;
                            if (Template.find.checkAverageSize(count, statsResult.result.avgObjSize, maxAllowedFetchSize)) {
                                Template.find.proceedFindQuery(connection, selectedCollection, selector, cursorOptions, (historyParams ? false : true));
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

Template.find.proceedFindQuery = function (connection, selectedCollection, selector, cursorOptions, saveHistory) {
    var params = {
        selector: selector,
        cursorOptions: cursorOptions
    };
    Meteor.call("find", connection, selectedCollection, selector, cursorOptions, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "find", params, saveHistory);
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
