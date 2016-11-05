/**
 * Created by RSercan on 29.12.2015.
 */

import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import {Settings} from "/lib/imports/collections/settings";
import Enums from "/lib/imports/enums";
import {initQueryHistories} from "./query_histories/query_histories";
import "/client/imports/views/query_templates/collection/aggregate/aggregate";
import "/client/imports/views/query_templates/collection/bulk_write/bulk_write";
import "/client/imports/views/query_templates/collection/count/count";
import "/client/imports/views/query_templates/collection/create_index/create_index";
import "/client/imports/views/query_templates/collection/delete/delete";
import "/client/imports/views/query_templates/collection/distinct/distinct";
import "/client/imports/views/query_templates/collection/drop_index/drop_index";
import "/client/imports/views/query_templates/collection/find/find";
import "/client/imports/views/query_templates/collection/findone/findone";
import "/client/imports/views/query_templates/collection/findone_and_delete/findone_and_delete";
import "/client/imports/views/query_templates/collection/findone_and_replace/findone_and_replace";
import "/client/imports/views/query_templates/collection/findone_and_update/findone_and_update";
import "/client/imports/views/query_templates/collection/geo_haystack_search/geo_haystack_search";
import "/client/imports/views/query_templates/collection/geo_near/geo_near";
import "/client/imports/views/query_templates/collection/index_information/index_information";
import "/client/imports/views/query_templates/collection/insert_many/insert_many";
import "/client/imports/views/query_templates/collection/is_capped/isCapped";
import "/client/imports/views/query_templates/collection/map_reduce/map_reduce";
import "/client/imports/views/query_templates/collection/options/options";
import "/client/imports/views/query_templates/collection/re_index/re_index";
import "/client/imports/views/query_templates/collection/rename/rename";
import "/client/imports/views/query_templates/collection/stats/stats";
import "/client/imports/views/query_templates/collection/update_many/update_many";
import "/client/imports/views/query_templates/collection/update_one/update_one";
import "./browse_collection.html";


// queries

var JSONEditor = require('jsoneditor');
var toastr = require('toastr');
var Ladda = require('ladda');
require('jquery-contextmenu');

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
        setResultToEditors(1, result, queryParams, queryInfo);
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

        // show last tab
        var lastTab = resultTabs.find('a:last');
        lastTab.tab('show');

        setResultToEditors(tabID, result, queryParams, queryInfo);
    }

    if (saveHistory) {
        saveQueryHistory(queryInfo, queryParams);
    }

};

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


const setResultToEditors = function (tabID, result, queryParams, queryInfo) {
    // set json editor
    getEditor(tabID).set(result);

    // set ace
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

    $('#tab-' + tabID).data('query', {
        queryInfo: queryInfo,
        queryParams: queryParams
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

    if (whichIsDisplayed === 'none') {
        var defaultIsAce = (defaultView !== 'Jsoneditor');
        if (!defaultIsAce) {
            result = jsonEditorHtml;
        } else {
            result = aceEditorHtml;
        }
    }
    else {
        if (whichIsDisplayed === 'jsonEditor') {
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

const getActiveTabHeader = function () {
    var text = $('#resultTabs').find('li.active').find('a').text();
    if (text && text.indexOf(' ') !== -1) {
        return text.substring(0, text.indexOf(' '));
    }
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
    var doc;
    try {
        doc = Helper.convertAndCheckJSON(getActiveEditorValue());
    }
    catch (e) {
        toastr.error('Syntax error, can not save document: ' + e);
        return;
    }

    swal({
        title: "Are you sure ?",
        text: 'Document will be updated using _id field of result view, are you sure ?',
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes!",
        cancelButtonText: "No"
    }, function (isConfirm) {
        if (isConfirm) {

            var l = Ladda.create(document.querySelector('#btnSaveFindOne'));
            l.start();

            var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
            if (doc._id) {
                Meteor.call("updateOne", selectedCollection, {_id: doc._id}, doc, {}, function (err, result) {
                    if (err || result.error) {
                        Helper.showMeteorFuncError(err, result, "Couldn't update document");
                    } else {
                        toastr.success('Successfully updated document');
                    }

                    Ladda.stopAll();
                });
            } else {
                toastr.error('Could not find _id of document, save failed !');
            }
        }
    });
};

const deleteDocument = function () {
    var doc;
    try {
        doc = Helper.convertAndCheckJSON(getActiveEditorValue());
    }
    catch (e) {
        toastr.error('Syntax error, can not delete document: ' + e);
        return;
    }

    swal({
        title: "Are you sure ?",
        text: 'Document will be deleted using _id field of result view,  are you sure ?',
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes!",
        cancelButtonText: "No"
    }, function (isConfirm) {
        if (isConfirm) {

            var l = Ladda.create(document.querySelector('#btnDelFindOne'));
            l.start();

            var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
            var i = 0;
            if (doc._id) {
                Meteor.call("delete", selectedCollection, {_id: doc._id}, function (err, result) {
                    if (err || result.error) {
                        Helper.showMeteorFuncError(err, result, "Couldn't delete document");
                    } else {
                        toastr.success('Successfully deleted document');
                        var tabToRemove = $('#resultTabs').find('li.active');
                        tabToRemove.remove();
                        $(tabToRemove.find('a').attr('href')).remove();

                        $('#divBrowseCollectionFooter').hide();
                    }

                    Ladda.stopAll();
                });
            } else {
                toastr.error('Could not find _id of document, delete failed !');
            }
        }
    });
};

const renderQuery = function (query) {
    if (!query || !query.queryInfo || query.queryInfo === 'rename') {
        return;
    }

    $('#cmbQueries').val((_.invert(Enums.QUERY_TYPES))[query.queryInfo]).trigger('chosen:updated');
    cmbQueriesChangeEvent();

    Template[query.queryInfo].renderQuery(query);
};

const cmbQueriesChangeEvent = function () {
    Session.set(Helper.strSessionSelectedOptions, []);

    var value = $('#cmbQueries').find(":selected").text();
    if (value) {
        Session.set(Helper.strSessionSelectedQuery, value);
    }

    if (value == Enums.QUERY_TYPES.FIND) {
        $('#btnExportQueryResult').show();
    } else {
        $('#btnExportQueryResult').hide();
    }
};

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

    $('[data-toggle="tooltip"]').tooltip({trigger: 'hover'});

    $.contextMenu({
        selector: "#resultTabs li",
        items: {
            close_others: {
                name: "Close Others", icon: "fa-times-circle", callback: function () {
                    var tabId = $(this).children('a').attr('href');
                    var resultTabs = $('#resultTabs li');
                    resultTabs.each(function (idx, li) {
                        let select = $(li);
                        if (select.children('a').attr('href') !== tabId) {
                            $(select.children('a').attr('href')).remove();
                            select.remove();
                        }
                    });

                    if (getActiveTabHeader() !== 'findOne') {
                        $('#divBrowseCollectionFooter').hide();
                    }
                }
            },
            close_all: {
                name: "Close All Tabs", icon: "fa-times", callback: function () {
                    var resultTabs = $('#resultTabs li');
                    resultTabs.each(function (idx, li) {
                        let select = $(li);
                        $(select.children('a').attr('href')).remove();
                        select.remove();
                    });

                    if (resultTabs.find('li').length == 0 || resultTabs.find('li.active').length == 0) {
                        $('#divBrowseCollectionFooter').hide();
                    }
                }
            }
        }
    });

    var resultTabs = $('#resultTabs');
    resultTabs.on('show.bs.tab', function (e) {
        var activeTabText = $(e.target).text();
        var activeTabQueryInfo = activeTabText.substring(0, activeTabText.indexOf(' '));

        var query = $($(e.target).attr('href')).data('query');
        if (query) {
            renderQuery(query);
        }

        // if active tab is not findOne hide footer
        if (activeTabQueryInfo == 'findOne') {
            $('#divBrowseCollectionFooter').show();
        } else {
            $('#divBrowseCollectionFooter').hide();
        }
    });

    // set onclose
    resultTabs.on('click', '.close', function () {
        $(this).parents('li').remove();
        $($(this).parents('a').attr('href')).remove();

        if (resultTabs.find('li').length == 0 || resultTabs.find('li.active').length == 0) {
            $('#divBrowseCollectionFooter').hide();
        }
    });


    clearQueryIfAdmin();
});

Template.browseCollection.events({
    'click #btnSaveFindOne': function (e) {
        e.preventDefault();
        saveEditor();
    },

    'click #btnDelFindOne': function (e) {
        e.preventDefault();
        deleteDocument();
    },

    'click #btnExportAsCSV'(){
        Template.find.executeQuery(null, 'CSV');
    },

    'click #btnExportAsJSON'(){
        Template.find.executeQuery(null, 'JSON');
    },

    'click #btnShowQueryHistories' () {
        $('#queryHistoriesModal').modal('show');
    },

    'change #cmbQueries'  () {
        cmbQueriesChangeEvent();
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
