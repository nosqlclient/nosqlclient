/**
 * Created by RSercan on 29.12.2015.
 */
/*global swal*/
/*global _*/
import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import {Settings} from "/lib/imports/collections/settings";
import {FlowRouter} from "meteor/kadira:flow-router";
import Enums from "/lib/imports/enums";
import {initQueryHistories} from "./query_histories/query_histories";
import {AceEditor} from "meteor/arch:ace-editor";
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
import "/client/imports/views/query_templates/collection/group/group";
import "../../query_templates/collection/find/query_wizard/query_wizard";
import "./browse_collection.html";

const JSONEditor = require('jsoneditor');
const toastr = require('toastr');
const Ladda = require('ladda');
require('jquery-contextmenu');

const init = function () {
    let cmb = $('#cmbQueries');
    cmb.append($("<optgroup id='optGroupCollectionQueries' label='Collection Queries'></optgroup>"));
    let cmbOptGroupCollection = cmb.find('#optGroupCollectionQueries');

    $.each(Helper.sortObjectByKey(Enums.QUERY_TYPES), function (key, value) {
        let option = $("<option></option>")
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
                    let tabId = $(this).children('a').attr('href');
                    let resultTabs = $('#resultTabs').find('li');
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

                    if (getActiveTabHeader() !== 'find') {
                        $('#divBrowseCollectionFindFooter').hide();
                    }
                }
            },
            close_all: {
                name: "Close All Tabs", icon: "fa-times", callback: function () {
                    let resultTabs = $('#resultTabs').find('li');
                    resultTabs.each(function (idx, li) {
                        let select = $(li);
                        $(select.children('a').attr('href')).remove();
                        select.remove();
                    });

                    if (resultTabs.find('li').length == 0 || resultTabs.find('li.active').length == 0) {
                        $('#divBrowseCollectionFooter').hide();
                        $('#divBrowseCollectionFindFooter').hide();
                    }
                }
            }
        }
    });

    const resultTabs = $('#resultTabs');
    resultTabs.on('show.bs.tab', function (e) {
        const activeTabText = $(e.target).text();
        const activeTabQueryInfo = activeTabText.substring(0, activeTabText.indexOf(' '));

        const query = $($(e.target).attr('href')).data('query');
        if (query) {
            renderQuery(query);
        }

        // if active tab is not findOne hide save/delete footer
        if (activeTabQueryInfo === 'findOne') {
            $('#divBrowseCollectionFooter').show();
        } else {
            $('#divBrowseCollectionFooter').hide();
        }

        // if active tab is not find hide save footer
        if (activeTabQueryInfo === 'find') {
            $('#divBrowseCollectionFindFooter').show();
        } else {
            $('#divBrowseCollectionFindFooter').hide();
        }
    });

    // set onclose
    resultTabs.on('click', '.close', function () {
        $(this).parents('li').remove();
        $($(this).parents('a').attr('href')).remove();

        if (resultTabs.find('li').length == 0 || resultTabs.find('li.active').length == 0) {
            $('#divBrowseCollectionFooter').hide();
            $('#divBrowseCollectionFindFooter').hide();
        }
    });

    clearQueryIfAdmin();
};

const clearQueryIfAdmin = function () {
    $.each(Enums.ADMIN_QUERY_TYPES, function (key, value) {
        if (value === Session.get(Helper.strSessionSelectedQuery)) {
            Session.set(Helper.strSessionSelectedQuery, null);
            Session.set(Helper.strSessionSelectedOptions, null);
        }
    });
};

export const initExecuteQuery = function () {
    // loading button
    Ladda.create(document.querySelector('#btnExecuteQuery')).start();
};

export const setQueryResult = function (result, queryInfo, queryParams, saveHistory) {
    const jsonEditor = $('#divActiveJsonEditor');
    const aceEditor = $('#divActiveAceEditor');
    const settings = Settings.findOne();

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
        // close all if setting for single tab is enabled
        const resultTabs = $('#resultTabs');
        if (settings.singleTabResultSets) {
            resultTabs.find('li').each(function (idx, li) {
                let select = $(li);
                $(select.children('a').attr('href')).remove();
                select.remove();
            });

            $('#divBrowseCollectionFooter').hide();
            $('#divBrowseCollectionFindFooter').hide();
        }

        // open a new tab
        const tabID = clarifyTabID();
        const tabContent = getResultTabContent(tabID, settings.defaultResultView, queryInfo);
        const tabTitle = queryInfo + " - " + Session.get(Helper.strSessionSelectedCollection);
        setAllTabsInactive();

        // set tab href
        resultTabs.append(
            $('<li><a href="#tab-' + tabID + '" data-toggle="tab"><i class="fa fa-book"></i>' + tabTitle +
                '<button class="close" type="button" title="Close">×</button></a></li>'));

        // set tab content
        $('#resultTabContents').append(tabContent);

        // show last tab
        const lastTab = resultTabs.find('a:last');
        lastTab.tab('show');

        setResultToEditors(tabID, result, queryParams, queryInfo);
    }

    if (saveHistory) saveQueryHistory(queryInfo, queryParams);

};

const getWhichResultViewShowing = function () {
    const jsonViews = $('div[id^="divActiveJsonEditor"]');
    const aceViews = $('div[id^="divActiveAceEditor"]');

    let whichIsDisplayed = 'none';
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

    Meteor.call('saveQueryHistory', {
        connectionId: Session.get(Helper.strSessionConnection),
        collectionName: Session.get(Helper.strSessionSelectedCollection),
        queryName: queryInfo,
        params: JSON.stringify(queryParams),
        date: new Date()
    });
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

    const activeTab = $('#tab-' + tabID);

    // cache query data
    activeTab.data('query', {
        queryInfo: queryInfo,
        queryParams: queryParams
    });

    // cache find data for save button
    if (queryInfo === 'find') {
        activeTab.data('findData', result);
    }
};

const clarifyTabID = function () {
    let result = 1;
    let tabIDArray = Session.get(Helper.strSessionUsedTabIDs);
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
        const otherTab = $(this);
        otherTab.removeClass('active');
        if (otherTab.find('#divActiveJsonEditor').length != 0) {
            // set all tabs different IDs to prevent setting result to existing editor.
            const uniqueID = new Date().getTime();
            otherTab.find('#divActiveJsonEditor').attr('id', 'divActiveJsonEditor-' + uniqueID);
            otherTab.find('#activeJsonEditor').attr('id', 'activeJsonEditor-' + uniqueID);
            otherTab.find('#divActiveAceEditor').attr('id', 'divActiveAceEditor-' + uniqueID);
            otherTab.find('#activeAceEditor').attr('id', 'activeAceEditor-' + uniqueID);
        }
    });
};

const getResultTabContent = function (tabID, defaultView) {
    const jsonEditorHtml = '<div class="tab-pane fade in active" id="tab-' + tabID + '">' +
        '<div id="divActiveJsonEditor" class="form-group"> ' +
        '<div id="activeJsonEditor" style="width: 100%;height:500px" class="col-lg-12"> ' +
        '</div> </div> ' +
        '<div id="divActiveAceEditor" class="form-group" style="display: none"> ' +
        '<div class="col-lg-12"> ' +
        '<pre id="activeAceEditor" style="height: 500px"></pre> ' +
        '</div> </div> </div>';

    const aceEditorHtml = '<div class="tab-pane fade in active" id="tab-' + tabID + '">' +
        '<div id="divActiveJsonEditor" class="form-group" style="display:none;"> ' +
        '<div id="activeJsonEditor" style="width: 100%;height:500px" class="col-lg-12"> ' +
        '</div> </div> ' +
        '<div id="divActiveAceEditor" class="form-group"> ' +
        '<div class="col-lg-12"> ' +
        '<pre id="activeAceEditor" style="height: 500px"></pre> ' +
        '</div> </div> </div>';

    const whichIsDisplayed = getWhichResultViewShowing();
    let result;

    if (whichIsDisplayed === 'none') {
        let defaultIsAce = (defaultView !== 'Jsoneditor');
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
    const tabView = $('#tab-' + tabID);
    if (!tabView.data('jsoneditor')) {
        const jsonEditor = new JSONEditor(document.getElementById('activeJsonEditor'), {
            mode: 'tree',
            modes: ['code', 'form', 'text', 'tree', 'view'],
            search: true
        });

        tabView.data('jsoneditor', jsonEditor);
    }

    return tabView.data('jsoneditor');
};

const getActiveTabHeader = function () {
    const text = $('#resultTabs').find('li.active').find('a').text();
    if (text && text.indexOf(' ') !== -1) {
        return text.substring(0, text.indexOf(' '));
    }
};

const getActiveEditorValue = function () {
    const resultTabs = $('#resultTabs');
    const resultContents = $('#resultTabContents');

    const whichIsDisplayed = getWhichResultViewShowing();
    if (whichIsDisplayed == 'aceEditor') {
        const foundAceEditor = resultContents.find('div.active').find('pre').attr('id');
        if (foundAceEditor) {
            return AceEditor.instance(foundAceEditor).getValue();
        }
    }
    else if (whichIsDisplayed == 'jsonEditor') {
        const tabId = resultTabs.find('li.active').find('a').attr('href');
        if ($(tabId).data('jsoneditor')) {
            return JSON.stringify($(tabId).data('jsoneditor').get());
        }
    }
};

const getChangedObjects = function (findData, activeEditorValue, deletedObjectIds, updateObjects, addedObjects) {
    for (let oldObj of findData) {
        let currentObj = _.find(activeEditorValue, function (it) {
            return _.isEqual(it._id, oldObj._id);
        });

        if (!currentObj) {
            deletedObjectIds.push(oldObj._id);
            continue;
        }

        if (!_.isEqual(oldObj, currentObj)) {
            updateObjects.push(currentObj);
        }
    }

    for (let currentObj of activeEditorValue) {
        let foundObj = _.find(findData, function (oldObj) {
            return _.isEqual(currentObj._id, oldObj._id)
        });
        if (!foundObj) {
            addedObjects.push(currentObj);
        }
    }
};

const checkAllElementsAreObject = function (arr, arr2) {
    for (let obj of arr) {
        if (obj === null || typeof obj !== 'object') {
            return false;
        }
    }

    for (let obj of arr2) {
        if (obj === null || typeof obj !== 'object') {
            return false;
        }
    }

    return true;
};

const saveFindEditor = function () {
    const activeTab = $('#resultTabs').find('li.active').find('a').attr('href');
    const findData = $(activeTab).data('findData');
    if (!findData) {
        toastr.error('Could not find query execution result, can not save !');
        return;
    }
    let deletedObjectIds = [];
    let updateObjects = [];
    let addedObjects = [];

    let activeEditorValue = Helper.convertAndCheckJSON(getActiveEditorValue());
    if (activeEditorValue['ERROR']) {
        toastr.error('Syntax error, can not save document: ' + activeEditorValue['ERROR']);
        return;
    }

    getChangedObjects(findData, activeEditorValue, deletedObjectIds, updateObjects, addedObjects);

    if (deletedObjectIds.length === 0 && updateObjects.length === 0 && addedObjects.length === 0) {
        toastr.info('Nothing to save, all objects are identical with old result');
        Ladda.stopAll();
        return;
    }

    if (!checkAllElementsAreObject(updateObjects, addedObjects)) {
        toastr.warning('All documents should be object, can not save !');
        Ladda.stopAll();
        return;
    }

    swal({
        title: "Are you sure ?",
        text: deletedObjectIds.length + ' documents will be deleted, ' + updateObjects.length + ' documents will be updated and ' + addedObjects.length + ' documents will be inserted into <b>' + Session.get(Helper.strSessionSelectedCollection) + '</b>, are you sure ?',
        type: "info",
        html: true,
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes!",
        cancelButtonText: "No"
    }, function (isConfirm) {
        if (isConfirm) {
            Ladda.create(document.querySelector('#btnSaveFind')).start();

            const selectedCollection = Session.get(Helper.strSessionSelectedCollection);

            Meteor.call("saveFindResult", selectedCollection, updateObjects, deletedObjectIds, addedObjects, Meteor.default_connection._lastSessionId, function (err) {
                if (err) {
                    Helper.showMeteorFuncError(err, null, "Couldn't proceed saving find result");
                } else {
                    toastr.success('Successfully saved !');
                    $(activeTab).data('findData', activeEditorValue);
                }

                Ladda.stopAll();
            });
        }
    });
};

const saveEditor = function () {
    let doc = Helper.convertAndCheckJSON(getActiveEditorValue());
    if (doc['ERROR']) {
        toastr.error('Syntax error, can not save document: ' + doc['ERROR']);
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

            Ladda.create(document.querySelector('#btnSaveFindOne')).start();

            const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
            if (doc._id) {
                Meteor.call("updateOne", selectedCollection, {_id: doc._id}, doc, {}, Meteor.default_connection._lastSessionId, function (err, result) {
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
    let doc = Helper.convertAndCheckJSON(getActiveEditorValue());
    if (doc['ERROR']) {
        toastr.error('Syntax error, can not delete document: ' + doc['ERROR']);
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

            Ladda.create(document.querySelector('#btnDelFindOne')).start();

            const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
            if (doc._id) {
                Meteor.call("delete", selectedCollection, {_id: doc._id}, Meteor.default_connection._lastSessionId, function (err, result) {
                    if (err || result.error) {
                        Helper.showMeteorFuncError(err, result, "Couldn't delete document");
                    } else {
                        toastr.success('Successfully deleted document');
                        const tabToRemove = $('#resultTabs').find('li.active');
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

    const value = $('#cmbQueries').find(":selected").text();
    if (value) {
        Session.set(Helper.strSessionSelectedQuery, value);
    }

    if (value == Enums.QUERY_TYPES.FIND) {
        $('#btnExportQueryResult').show();
        $('#btnQueryWizard').show();
    } else {
        $('#btnExportQueryResult').hide();
        $('#btnQueryWizard').hide();
    }
};

Template.browseCollection.onCreated(function () {
    Session.set(Helper.strSessionSelectedOptions, []);
    Session.set(Helper.strSessionSelectedQuery, Enums.QUERY_TYPES.FIND);
});

Template.browseCollection.onRendered(function () {
    if (!Session.get(Helper.strSessionSelectedCollection)) {
        FlowRouter.go('/databaseStats');
        return;
    }

    this.subscribe('settings');
    this.subscribe('connections');
    this.subscribe('queryHistories');
    this.subscribe('mongoclient_update');

    Meteor.call("checkMongoclientVersion", function (err, res) {
        if (res) {
            toastr.info(res, 'Update', {timeOut: 0, extendedTimeOut: 0, preventDuplicates: true});
        }
    });

    init();
});

Template.browseCollection.events({
    'click #btnQueryWizard' (e) {
        e.preventDefault();
        $('#queryWizardModal').modal('show');
    },

    'click #btnSaveFindOne' (e) {
        e.preventDefault();
        saveEditor();
    },

    'click #btnSaveFind' (e){
        e.preventDefault();
        saveFindEditor();
    },

    'click #btnDelFindOne' (e) {
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
        const jsonViews = $('div[id^="divActiveJsonEditor"]');
        const aceViews = $('div[id^="divActiveAceEditor"]');

        const whichIsDisplayed = getWhichResultViewShowing();

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
        const queryTemplate = Session.get(Helper.strSessionSelectedQuery);
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
                return 'This query replaces whole document which matched by <strong>selector</strong> with the <strong>set</strong> object';

            case Enums.QUERY_TYPES.GROUP:
                return '<strong>Deprecated since version 3.4</strong> Use db.collection.aggregate() with the $group stage or db.collection.mapReduce() instead';

            case Enums.QUERY_TYPES.FINDONE_AND_DELETE:
                return '<strong><span style="color: red; ">CAUTION:</span></strong> This query removes whole document which matched by <strong>selector</strong>';

            case Enums.QUERY_TYPES.CREATE_INDEX:
                return 'Since mongodb version <strong>3.0.0</strong>, this query can be used instead of <strong>ensureIndex</strong>';

            case Enums.QUERY_TYPES.DELETE:
                return '<strong><span style="color: red; ">CAUTION:</span></strong> This query removes whole document(s) which matched by <strong>selector</strong>';

            case Enums.QUERY_TYPES.GEO_HAYSTACK_SEARCH:
                return 'This query executes a geo search using a <strong>geo haystack index</strong> on a collection';

            case Enums.QUERY_TYPES.IS_CAPPED:
                return 'Returns the information of if the collection is a <strong>capped</strong> collection';

            case Enums.QUERY_TYPES.OPTIONS:
                return 'Returns <strong>collection</strong> options';

            case Enums.QUERY_TYPES.RE_INDEX:
                return 'Reindex all indexes on the collection <strong>Warning:</strong> reIndex is a blocking operation <i>(indexes are rebuilt in the foreground)</i> and will be slow for large collections';

            case Enums.QUERY_TYPES.UPDATE_MANY:
                return 'Updates all documents which matched by <strong>Selector</strong>';

            default:
                return '';
        }
    }

});
