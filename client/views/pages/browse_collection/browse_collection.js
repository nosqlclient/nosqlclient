/**
 * Created by RSercan on 29.12.2015.
 */
Template.browseCollection.onRendered(function () {
    if (!Session.get(Template.strSessionSelectedCollection)) {
        Router.go('databaseStats');
        return;
    }

    var cmb = $('#cmbQueries');
    cmb.append($("<optgroup id='optGroupCollectionQueries' label='Collection Queries'></optgroup>"));
    var cmbOptGroupCollection = cmb.find('#optGroupCollectionQueries');

    $.each(Template.sortObjectByKey(QUERY_TYPES), function (key, value) {
        cmbOptGroupCollection.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });
    cmb.chosen();

});

Template.browseCollection.events({
    'click #btnShowQueryHistories': function () {
        $('#queryHistoriesModal').modal('show');
    },

    'change #cmbQueries': function () {
        Session.set(Template.strSessionSelectedOptions, []);

        var value = $('#cmbQueries').find(":selected").text();
        if (value) {
            Session.set(Template.strSessionSelectedQuery, value);
        }
    },

    'click #btnSwitchView': function () {
        var jsonViews = $('div[id^="divActiveJsonEditor"]');
        var aceViews = $('div[id^="divActiveAceEditor"]');

        var whichIsDisplayed = Template.browseCollection.getWhichResultViewShowing();

        if (whichIsDisplayed != 'none') {
            if (whichIsDisplayed == 'jsonEditor') {
                aceViews.each(function () {
                    $(this).show('slow');
                });
                jsonViews.each(function () {
                    $(this).hide();
                });
            }
            else {
                jsonViews.each(function () {
                    $(this).show('slow');
                });
                aceViews.each(function () {
                    $(this).hide();
                });
            }
        }
    },

    'click #btnExecuteQuery': function () {
        var queryTemplate = Session.get(Template.strSessionSelectedQuery);
        if (queryTemplate) {
            Template[queryTemplate].executeQuery();
        } else {
            toastr.warning('Select Query', 'Please select a query first ');
        }
    }
});

Template.browseCollection.getWhichResultViewShowing = function () {
    var jsonViews = $('div[id^="divActiveJsonEditor"]');
    var aceViews = $('div[id^="divActiveAceEditor"]');

    var whichIsDisplayed = 'none';
    jsonViews.each(function () {
        if ($(this).css('display') != 'none') {
            whichIsDisplayed = 'jsonEditor';
        }
    });

    aceViews.each(function () {
        if ($(this).css('display') != 'none') {
            whichIsDisplayed = 'aceEditor';
        }
    });

    return whichIsDisplayed;
};

Template.browseCollection.helpers({
    'getQueryTemplate': function () {
        return Session.get(Template.strSessionSelectedQuery);
    },

    'getHelpBlockForSelectedQuery': function () {
        switch (Session.get(Template.strSessionSelectedQuery)) {
            case QUERY_TYPES.FINDONE_AND_REPLACE:
                return Spacebars.SafeString('This query replaces whole document which matched by <strong>selector</strong> with the <strong>set</strong> object');

            case QUERY_TYPES.FINDONE_AND_DELETE:
                return Spacebars.SafeString('<strong><font color=\'red\'>CAUTION:</font></strong> This query removes whole document which matched by <strong>selector</strong>');

            case QUERY_TYPES.CREATE_INDEX:
                return Spacebars.SafeString('Since mongodb version <strong>3.0.0</strong>, this query can be used instead of <strong>ensureIndex</strong>');

            case QUERY_TYPES.DELETE:
                return Spacebars.SafeString('<strong><font color=\'red\'>CAUTION:</font></strong> This query removes whole document(s) which matched by <strong>selector</strong>');

            case QUERY_TYPES.GEO_HAYSTACK_SEARCH:
                return Spacebars.SafeString('This query executes a geo search using a <strong>geo haystack index</strong> on a collection');

            case QUERY_TYPES.IS_CAPPED:
                return Spacebars.SafeString('Returns the information of if the collection is a <strong>capped</strong> collection');

            case QUERY_TYPES.OPTIONS:
                return Spacebars.SafeString('Returns <strong>collection</strong> options');

            case QUERY_TYPES.RE_INDEX:
                return Spacebars.SafeString('Reindex all indexes on the collection <strong>Warning:</strong> reIndex is a blocking operation <i>(indexes are rebuilt in the foreground)</i> and will be slow for large collections');

            case QUERY_TYPES.UPDATE_MANY:
                return Spacebars.SafeString('Updates all documents which matched by <strong>Selector</strong');

            default:
                return '';
        }
    }

});

Template.browseCollection.initExecuteQuery = function () {
    // loading button
    var l = $('#btnExecuteQuery').ladda();
    l.ladda('start');
};

Template.browseCollection.setResult = function (result, queryInfo) {
    var jsonEditor = $('#divActiveJsonEditor');
    var aceEditor = $('#divActiveAceEditor');
    var settings = Settings.findOne();

    if (jsonEditor.css('display') == 'none' && aceEditor.css('display') == 'none') {
        // there's only one tab, set results
        if (settings.defaultResultView == 'Jsoneditor') {
            jsonEditor.show('slow');
        }
        else {
            aceEditor.show('slow');
        }
        Template.browseCollection.setResultToEditors(1, result);
    }
    else {
        // open a new tab
        var tabID = Template.browseCollection.clarifyTabID();
        var tabContent = Template.browseCollection.getResultTabContent(tabID, settings.defaultResultView, queryInfo);
        queryInfo = queryInfo + " - " + Session.get(Template.strSessionSelectedCollection);
        Template.browseCollection.setAllTabsInactive();
        var resultTabs = $('#resultTabs');

        // set tab href
        resultTabs.append(
            $('<li><a href="#tab-' + tabID + '" data-toggle="tab"><i class="fa fa-book"></i>' + queryInfo +
                '<button class="close" type="button" title="Close">×</button></a></li>'));

        // set tab content
        $('#resultTabContents').append(tabContent);

        // set onclose
        resultTabs.on('click', '.close', function () {
            var tabID = $(this).parents('a').attr('href');
            $(this).parents('li').remove();
            $(tabID).remove();
        });

        // show last tab
        var lastTab = $('#resultTabs a:last');
        lastTab.tab('show');

        Template.browseCollection.setResultToEditors(tabID, result);
    }
};

Template.browseCollection.setResultToEditors = function (tabID, result) {
    // set json editor
    Template.browseCollection.getEditor(tabID).set(result);

    AceEditor.instance('activeAceEditor', {
        mode: 'javascript',
        theme: 'dawn'
    }, function (editor) {
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            fontSize: '12pt',
            showPrintMargin: false
        });
        editor.setValue(JSON.stringify(result, null, '\t'), -1);
    });
};

Template.browseCollection.clarifyTabID = function () {
    var result = 1;
    var tabIDArray = Session.get(Template.strSessionUsedTabIDs);
    if (tabIDArray == undefined || tabIDArray.length == 0) {
        tabIDArray = [result];
        Session.set(Template.strSessionUsedTabIDs, tabIDArray);
        return result;
    }

    result = tabIDArray[tabIDArray.length - 1] + 1;

    tabIDArray.push(result);
    Session.set(Template.strSessionUsedTabIDs, tabIDArray);
    return result;
};

Template.browseCollection.setAllTabsInactive = function () {
    $('#resultTabContents').each(function () {
        var otherTab = $(this);
        otherTab.removeClass('active');
        if (otherTab.find('#divActiveJsonEditor').length != 0) {
            // set all tabs different IDs to prevent setting result to existing editor.
            var uniqueID = new Date().getTime();
            otherTab.find('#divActiveJsonEditor').attr('id', 'divActiveJsonEditor-' + uniqueID);
            otherTab.find('#activeJsonEditor').attr('id', 'activeJsonEditor-' + uniqueID);
            otherTab.find('#divActiveAceEditor').attr('id', 'divActiveAceEditor-' + uniqueID);
            otherTab.find('#activeAceEditor').attr('id', 'activeAceEditor-' + uniqueID);
        }
    });
};

Template.browseCollection.getResultTabContent = function (tabID, defaultView) {
    var jsonEditorHtml = '<div class="tab-pane fade in active" id="tab-' + tabID + '">' +
        '<div id="divActiveJsonEditor" class="form-group"> ' +
        '<div id="activeJsonEditor" style="width: 100%;height:500px" class="col-lg-12"> ' +
        '</div> </div> ' +
        '<div id="divActiveAceEditor" class="form-group" style="display: none"> ' +
        '<div class="col-lg-12"> ' +
        '<pre id="activeAceEditor" style="height: 500px"></pre> ' +
        '</div> </div> </div>';

    var aceEditorHtml = '<div class="tab-pane fade in active" id="tab-' + tabID + '">' +
        '<div id="divActiveJsonEditor" class="form-group" style="display:none;"> ' +
        '<div id="activeJsonEditor" style="width: 100%;height:500px" class="col-lg-12"> ' +
        '</div> </div> ' +
        '<div id="divActiveAceEditor" class="form-group"> ' +
        '<div class="col-lg-12"> ' +
        '<pre id="activeAceEditor" style="height: 500px"></pre> ' +
        '</div> </div> </div>';

    var whichIsDisplayed = Template.browseCollection.getWhichResultViewShowing();
    var result;

    if (whichIsDisplayed == 'none') {
        var defaultIsAce = (defaultView == 'Jsoneditor') ? false : true;
        if (!defaultIsAce) {
            result = jsonEditorHtml;
        } else {
            result = aceEditorHtml;
        }
    }
    else {
        if (whichIsDisplayed == 'jsonEditor') {
            result = jsonEditorHtml;
        }
        else {
            result = aceEditorHtml;
        }
    }

    return result;
};

Template.browseCollection.getEditor = function (tabID) {
    var tabView = $('#tab-' + tabID);
    if (!tabView.data('jsoneditor')) {
        var jsonEditor = new JSONEditor(document.getElementById('activeJsonEditor'), {
            mode: 'tree',
            modes: ['code', 'form', 'text', 'tree', 'view'],
            search: true
        });

        tabView.data('jsoneditor', jsonEditor);
    }

    return tabView.data('jsoneditor');
};