import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/helper';
import {Settings} from '/lib/collections/settings';
import Enums from '/lib/enums';
import {initQueryHistories} from './query_histories/query_histories';

var JSONEditor = require('jsoneditor');
var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 29.12.2015.
 */
Template.browseCollection.onCreated(function () {
    Session.set(Helper.strSessionSelectedOptions, []);
    Session.set(Helper.strSessionSelectedQuery, Enums.QUERY_TYPES.FIND);
});

Template.browseCollection.onRendered(function () {
    if (!Session.get(Helper.strSessionSelectedCollection)) {
        Router.go('databaseStats');
        return;
    }

    var cmb = $('#cmbQueries');
    cmb.append($("<optgroup id='optGroupCollectionQueries' label='Collection Queries'></optgroup>"));
    var cmbOptGroupCollection = cmb.find('#optGroupCollectionQueries');

    $.each(Helper.sortObjectByKey(Enums.QUERY_TYPES), function (key, value) {
        var option = $("<option></option>")
            .attr("value", key)
            .text(value);
        if (value === Enums.QUERY_TYPES.FIND) {
            option.attr('selected', true);
        }
        cmbOptGroupCollection.append(option);
    });
    cmb.chosen();

    $('#queryHistoriesModal').on('show.bs.modal', function () {
        initQueryHistories();
    });

    $('#aConvertIsoDates, #aConvertObjectIds').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    $('[data-toggle="tooltip"]').tooltip({trigger: 'hover'});

    // see #108
    if (Session.get(Helper.strSessionSelectedQuery) != Enums.QUERY_TYPES.FIND) {
        Helper.changeConvertOptionsVisibility(false);
    }

    clearQueryIfAdmin();
});

Template.browseCollection.events({
    'click #btnSaveFindFindOne' (e) {
        e.preventDefault();
        saveEditor();
    },

    'click #btnDelFindFindOne'  (e) {
        e.preventDefault();
        deleteDocument();
    },

    'click #btnShowQueryHistories' () {
        $('#queryHistoriesModal').modal('show');
    },

    'change #cmbQueries'  () {
        Session.set(Helper.strSessionSelectedOptions, []);

        var value = $('#cmbQueries').find(":selected").text();
        if (value) {
            Session.set(Helper.strSessionSelectedQuery, value);
        }
    },

    'click #btnSwitchView'  () {
        var jsonViews = $('div[id^="divActiveJsonEditor"]');
        var aceViews = $('div[id^="divActiveAceEditor"]');

        var whichIsDisplayed = getWhichResultViewShowing();

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

    'click #btnExecuteQuery'  () {
        var queryTemplate = Session.get(Helper.strSessionSelectedQuery);
        if (queryTemplate) {
            Template[queryTemplate].executeQuery();
        } else {
            toastr.warning('Select Query', 'Please select a query first ');
        }
    }
});

const getWhichResultViewShowing = function () {
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
    'getQueryTemplate' () {
        return Session.get(Helper.strSessionSelectedQuery);
    },

    'getHelpBlockForSelectedQuery' () {
        switch (Session.get(Helper.strSessionSelectedQuery)) {
            case Enums.QUERY_TYPES.FINDONE_AND_REPLACE:
                return Spacebars.SafeString('This query replaces whole document which matched by <strong>selector</strong> with the <strong>set</strong> object');

            case Enums.QUERY_TYPES.FINDONE_AND_DELETE:
                return Spacebars.SafeString('<strong><font color=\'red\'>CAUTION:</font></strong> This query removes whole document which matched by <strong>selector</strong>');

            case Enums.QUERY_TYPES.CREATE_INDEX:
                return Spacebars.SafeString('Since mongodb version <strong>3.0.0</strong>, this query can be used instead of <strong>ensureIndex</strong>');

            case Enums.QUERY_TYPES.DELETE:
                return Spacebars.SafeString('<strong><font color=\'red\'>CAUTION:</font></strong> This query removes whole document(s) which matched by <strong>selector</strong>');

            case Enums.QUERY_TYPES.GEO_HAYSTACK_SEARCH:
                return Spacebars.SafeString('This query executes a geo search using a <strong>geo haystack index</strong> on a collection');

            case Enums.QUERY_TYPES.IS_CAPPED:
                return Spacebars.SafeString('Returns the information of if the collection is a <strong>capped</strong> collection');

            case Enums.QUERY_TYPES.OPTIONS:
                return Spacebars.SafeString('Returns <strong>collection</strong> options');

            case Enums.QUERY_TYPES.RE_INDEX:
                return Spacebars.SafeString('Reindex all indexes on the collection <strong>Warning:</strong> reIndex is a blocking operation <i>(indexes are rebuilt in the foreground)</i> and will be slow for large collections');

            case Enums.QUERY_TYPES.UPDATE_MANY:
                return Spacebars.SafeString('Updates all documents which matched by <strong>Selector</strong>');

            default:
                return '';
        }
    }

});

const clearQueryIfAdmin = function () {
    $.each(Enums.ADMIN_QUERY_TYPES, function (key, value) {
        if (value == Session.get(Helper.strSessionSelectedQuery)) {
            Session.set(Helper.strSessionSelectedQuery, undefined);
            Session.set(Helper.strSessionSelectedOptions, undefined);
        }
    });
};

export const initExecuteQuery = function () {
    // loading button
    var l = Ladda.create(document.querySelector('#btnExecuteQuery'));
    l.start();
};

export const setQueryResult = function (result, queryInfo, queryParams, saveHistory) {
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
        setResultToEditors(1, result);
    }
    else {
        // open a new tab
        var tabID = clarifyTabID();
        var tabContent = getResultTabContent(tabID, settings.defaultResultView, queryInfo);
        var tabTitle = queryInfo + " - " + Session.get(Helper.strSessionSelectedCollection);
        setAllTabsInactive();
        var resultTabs = $('#resultTabs');

        // set tab href
        resultTabs.append(
            $('<li><a href="#tab-' + tabID + '" data-toggle="tab"><i class="fa fa-book"></i>' + tabTitle +
                '<button class="close" type="button" title="Close">×</button></a></li>'));

        // set tab content
        $('#resultTabContents').append(tabContent);

        // set onclose
        resultTabs.on('click', '.close', function () {
            var tabID = $(this).parents('a').attr('href');
            $(this).parents('li').remove();
            $(tabID).remove();

            if (resultTabs.find('li').length == 0 || resultTabs.find('li.active').length == 0) {
                $('#divBrowseCollectionFooter').hide();
            }
        });

        resultTabs.on('shown.bs.tab', function (e) {
            var activeTabText = $(e.target).text();
            var activeTabQueryInfo = activeTabText.substring(0, activeTabText.indexOf(' '));
            // see #104

            if (activeTabQueryInfo == 'findOne' || activeTabQueryInfo == 'find') {
                $('#divBrowseCollectionFooter').show();
            } else {
                $('#divBrowseCollectionFooter').hide();
            }

        });

        // show last tab
        var lastTab = resultTabs.find('a:last');
        lastTab.tab('show');

        setResultToEditors(tabID, result);
    }

    if (saveHistory) {
        saveQueryHistory(queryInfo, queryParams);
    }

};

const saveQueryHistory = function (queryInfo, queryParams) {
    if (!queryParams) {
        queryParams = {};
    }

    var history = {
        connectionId: Session.get(Helper.strSessionConnection),
        collectionName: Session.get(Helper.strSessionSelectedCollection),
        queryName: queryInfo,
        params: JSON.stringify(queryParams),
        date: new Date()
    };

    Meteor.call('saveQueryHistory', history);
};


const setResultToEditors = function (tabID, result) {
    // set json editor
    getEditor(tabID).set(result);

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

const clarifyTabID = function () {
    var result = 1;
    var tabIDArray = Session.get(Helper.strSessionUsedTabIDs);
    if (tabIDArray == undefined || tabIDArray.length == 0) {
        tabIDArray = [result];
        Session.set(Helper.strSessionUsedTabIDs, tabIDArray);
        return result;
    }

    result = tabIDArray[tabIDArray.length - 1] + 1;

    tabIDArray.push(result);
    Session.set(Helper.strSessionUsedTabIDs, tabIDArray);
    return result;
};

const setAllTabsInactive = function () {
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

const getResultTabContent = function (tabID, defaultView) {
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

    var whichIsDisplayed = getWhichResultViewShowing();
    var result;

    if (whichIsDisplayed == 'none') {
        var defaultIsAce = (defaultView != 'Jsoneditor');
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

const getEditor = function (tabID) {
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

const getActiveEditorValue = function () {
    var resultTabs = $('#resultTabs');
    var resultContents = $('#resultTabContents');

    var whichIsDisplayed = getWhichResultViewShowing();
    if (whichIsDisplayed == 'aceEditor') {
        var foundAceEditor = resultContents.find('div.active').find('pre').attr('id');
        if (foundAceEditor) {
            return ace.edit(foundAceEditor).getValue();
        }
    }
    else if (whichIsDisplayed == 'jsonEditor') {
        var tabId = resultTabs.find('li.active').find('a').attr('href');
        if ($(tabId).data('jsoneditor')) {
            return JSON.stringify($(tabId).data('jsoneditor').get());
        }
    }
};

const saveEditor = function () {
    var convertedDocs;
    try {
        convertedDocs = Helper.convertAndCheckJSONAsArray(getActiveEditorValue());
    }
    catch (e) {
        toastr.error('Syntax error, can not save document(s): ' + e);
        return;
    }

    swal({
        title: "Are you sure ?",
        text: convertedDocs.length + ' document(s) will be updated (_id field is unchangeable),  are you sure ?',
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes!",
        cancelButtonText: "No"
    }, function (isConfirm) {
        if (isConfirm) {

            var l = Ladda.create(document.querySelector('#btnSaveFindFindOne'));
            l.start();

            var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
            var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
            var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;
            var i = 0;
            _.each(convertedDocs, function (doc) {
                if (doc._id) {
                    Meteor.call("updateOne", selectedCollection, {_id: doc._id}, doc, {}, convertIds, convertDates, function (err, result) {
                        if (err || result.error) {
                            Helper.showMeteorFuncError(err, result, "Couldn't update one of the documents");
                            Ladda.stopAll();
                        } else {
                            if ((i++) == (convertedDocs.length - 1)) {
                                // last time
                                toastr.success('Successfully updated document(s)');
                                Ladda.stopAll();
                            }
                        }
                    });
                }
            });
        }
    });

};


const deleteDocument = function () {
    var convertedDocs;
    try {
        convertedDocs = Helper.convertAndCheckJSONAsArray(getActiveEditorValue());
    }
    catch (e) {
        toastr.error('Syntax error, can not save document(s): ' + e);
        return;
    }

    swal({
        title: "Are you sure ?",
        text: convertedDocs.length + ' document(s) will be deleted,  are you sure ?',
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes!",
        cancelButtonText: "No"
    }, function (isConfirm) {
        if (isConfirm) {

            var l = Ladda.create(document.querySelector('#btnDelFindFindOne'));
            l.start();

            var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
            var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
            var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;
            var i = 0;
            _.each(convertedDocs, function (doc) {
                if (doc._id) {
                    Meteor.call("delete", selectedCollection, {_id: doc._id}, convertIds, convertDates, function (err, result) {
                        if (err || result.error) {
                            Helper.showMeteorFuncError(err, result, "Couldn't delete one of the documents");
                            Ladda.stopAll();
                        } else {
                            if ((i++) == (convertedDocs.length - 1)) {
                                // last time
                                toastr.success('Successfully deleted document(s)');
                                Ladda.stopAll();
                            }
                        }
                    });
                }
            });
        }
    });

};

