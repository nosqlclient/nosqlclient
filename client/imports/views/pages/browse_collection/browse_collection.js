/**
 * Created by RSercan on 29.12.2015.
 */
/* global swal */
/* global _ */
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helpers/helper';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Communicator } from '/client/imports/facades';
import Enums from '/lib/imports/enums';
import { initQueryHistories } from '/client/imports/views/pages/browse_collection/query_histories/query_histories';
import '/client/imports/views/query_templates/collection/aggregate/aggregate';
import '/client/imports/views/query_templates/collection/bulk_write/bulk_write';
import '/client/imports/views/query_templates/collection/count/count';
import '/client/imports/views/query_templates/collection/create_index/create_index';
import '/client/imports/views/query_templates/collection/delete/delete';
import '/client/imports/views/query_templates/collection/distinct/distinct';
import '/client/imports/views/query_templates/collection/drop_index/drop_index';
import '/client/imports/views/query_templates/collection/find/find';
import '/client/imports/views/query_templates/collection/findone/findone';
import '/client/imports/views/query_templates/collection/findone_and_delete/findone_and_delete';
import '/client/imports/views/query_templates/collection/findone_and_replace/findone_and_replace';
import '/client/imports/views/query_templates/collection/findone_and_update/findone_and_update';
import '/client/imports/views/query_templates/collection/geo_haystack_search/geo_haystack_search';
import '/client/imports/views/query_templates/collection/geo_near/geo_near';
import '/client/imports/views/query_templates/collection/index_information/index_information';
import '/client/imports/views/query_templates/collection/insert_many/insert_many';
import '/client/imports/views/query_templates/collection/is_capped/isCapped';
import '/client/imports/views/query_templates/collection/map_reduce/map_reduce';
import '/client/imports/views/query_templates/collection/options/options';
import '/client/imports/views/query_templates/collection/re_index/re_index';
import '/client/imports/views/query_templates/collection/rename/rename';
import '/client/imports/views/query_templates/collection/stats/stats';
import '/client/imports/views/query_templates/collection/update_many/update_many';
import '/client/imports/views/query_templates/collection/update_one/update_one';
import '/client/imports/views/query_templates/collection/group/group';
import '../../query_templates/collection/find/query_wizard/query_wizard';
import './browse_collection.html';

const toastr = require('toastr');
const Ladda = require('ladda');
require('jquery-contextmenu');

export const initExecuteQuery = function () {
  // loading button
  Ladda.create(document.querySelector('#btnExecuteQuery')).start();
};

const cmbQueriesChangeEvent = function () {
  Session.set(Helper.strSessionSelectedOptions, []);

  const value = $('#cmbQueries').find(':selected').text();
  if (value) {
    Session.set(Helper.strSessionSelectedQuery, value);
  }

  if (value === Enums.QUERY_TYPES.FIND) {
    $('#btnExportQueryResult').show();
    $('#btnQueryWizard').show();
  } else {
    $('#btnExportQueryResult').hide();
    $('#btnQueryWizard').hide();
  }
};

const renderQuery = function (query) {
  if (!query || !query.queryInfo || query.queryInfo === 'rename') {
    return;
  }

  $('#cmbQueries').val((_.invert(Enums.QUERY_TYPES))[query.queryInfo]).trigger('chosen:updated');
  cmbQueriesChangeEvent();

  Template[query.queryInfo].renderQuery(query);
};

const getActiveTabHeader = () => {
  const text = $('#resultTabs').find('li.active').find('a').text();
  if (text && text.indexOf(' ') !== -1) {
    return text.substring(0, text.indexOf(' '));
  }
};

const init = function () {
  const cmb = $('#cmbQueries');
  cmb.append($("<optgroup id='optGroupCollectionQueries' label='Collection Queries'></optgroup>"));
  const cmbOptGroupCollection = cmb.find('#optGroupCollectionQueries');

  $.each(Helper.sortObjectByKey(Enums.QUERY_TYPES), (key, value) => {
    const option = $('<option></option>')
      .attr('value', key)
      .text(value);
    if (value === Enums.QUERY_TYPES.FIND) {
      option.attr('selected', true);
    }
    cmbOptGroupCollection.append(option);
  });
  cmb.chosen();

  $('#queryHistoriesModal').on('show.bs.modal', () => {
    initQueryHistories();
  });

  $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });

  $.contextMenu({
    selector: '#resultTabs li',
    items: {
      close_others: {
        name: 'Close Others',
        icon: 'fa-times-circle',
        callback() {
          const tabId = $(this).children('a').attr('href');
          const resultTabs = $('#resultTabs').find('li');
          resultTabs.each((idx, li) => {
            const select = $(li);
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
        },
      },
      close_all: {
        name: 'Close All Tabs',
        icon: 'fa-times',
        callback() {
          const resultTabs = $('#resultTabs').find('li');
          resultTabs.each((idx, li) => {
            const select = $(li);
            $(select.children('a').attr('href')).remove();
            select.remove();
          });

          if (resultTabs.find('li').length === 0 || resultTabs.find('li.active').length === 0) {
            $('#divBrowseCollectionFooter').hide();
            $('#divBrowseCollectionFindFooter').hide();
          }
        },
      },
    },
  });

  const resultTabs = $('#resultTabs');
  resultTabs.on('show.bs.tab', (e) => {
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

    if (resultTabs.find('li').length === 0 || resultTabs.find('li.active').length === 0) {
      $('#divBrowseCollectionFooter').hide();
      $('#divBrowseCollectionFindFooter').hide();
    }
  });

  clearQueryIfAdmin();
};

const getChangedObjects = function (findData, activeEditorValue, deletedObjectIds, updateObjects, addedObjects) {
  for (const oldObj of findData) {
    const currentObj = _.find(activeEditorValue, it => _.isEqual(it._id, oldObj._id));

    if (!currentObj) {
      deletedObjectIds.push(oldObj._id);
      continue;
    }

    if (!_.isEqual(oldObj, currentObj)) {
      updateObjects.push(currentObj);
    }
  }

  for (const currentObj of activeEditorValue) {
    const foundObj = _.find(findData, oldObj => _.isEqual(currentObj._id, oldObj._id));
    if (!foundObj) {
      addedObjects.push(currentObj);
    }
  }
};

const checkAllElementsAreObject = function (arr, arr2) {
  for (const obj of arr) {
    if (obj === null || typeof obj !== 'object') {
      return false;
    }
  }

  for (const obj of arr2) {
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
  const deletedObjectIds = [];
  const updateObjects = [];
  const addedObjects = [];

  const activeEditorValue = Helper.convertAndCheckJSON(getActiveEditorValue());
  if (activeEditorValue.ERROR) {
    toastr.error(`Syntax error, can not save document: ${activeEditorValue.ERROR}`);
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
    title: 'Are you sure ?',
    text: `${deletedObjectIds.length} documents will be deleted, ${updateObjects.length} documents will be updated and 
            ${addedObjects.length} documents will be inserted into <b>${Session.get(Helper.strSessionSelectedCollection)}</b>, are you sure ?`,
    type: 'info',
    html: true,
    showCancelButton: true,
    confirmButtonColor: '#DD6B55',
    confirmButtonText: 'Yes!',
    cancelButtonText: 'No',
  }, (isConfirm) => {
    if (isConfirm) {
      Ladda.create(document.querySelector('#btnSaveFind')).start();

      const selectedCollection = Session.get(Helper.strSessionSelectedCollection);

      Communicator.call({
        methodName: 'saveFindResult',
        args: { selectedCollection, updateObjects, deletedObjectIds, addedObjects },
        callback: (err) => {
          if (err) {
            Helper.showMeteorFuncError(err, null, "Couldn't proceed saving find result");
          } else {
            toastr.success('Successfully saved !');
            $(activeTab).data('findData', activeEditorValue);
          }
          Ladda.stopAll();
        }
      });
    }
  });
};

const showQueryInfo = () => {

};

const saveEditor = function () {
  const doc = Helper.convertAndCheckJSON(getActiveEditorValue());
  if (doc.ERROR) {
    toastr.error(`Syntax error, can not save document: ${doc.ERROR}`);
    return;
  }

  swal({
    title: 'Are you sure ?',
    text: 'Document will be updated using _id field of result view, are you sure ?',
    type: 'info',
    showCancelButton: true,
    confirmButtonColor: '#DD6B55',
    confirmButtonText: 'Yes!',
    cancelButtonText: 'No',
  }, (isConfirm) => {
    if (isConfirm) {
      Ladda.create(document.querySelector('#btnSaveFindOne')).start();

      const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
      if (doc._id) {
        Communicator.call({
          methodName: 'updateOne',
          args: { selectedCollection, selector: { _id: doc._id }, setObject: doc },
          callback: (err, result) => {
            if (err || result.error) {
              Helper.showMeteorFuncError(err, result, "Couldn't update document");
            } else {
              toastr.success('Successfully updated document');
            }

            Ladda.stopAll();
          }
        });
      } else {
        toastr.error('Could not find _id of document, save failed !');
      }
    }
  });
};

const deleteDocument = function () {
  const doc = Helper.convertAndCheckJSON(getActiveEditorValue());
  if (doc.ERROR) {
    toastr.error(`Syntax error, can not delete document: ${doc.ERROR}`);
    return;
  }

  swal({
    title: 'Are you sure ?',
    text: 'Document will be deleted using _id field of result view,  are you sure ?',
    type: 'info',
    showCancelButton: true,
    confirmButtonColor: '#DD6B55',
    confirmButtonText: 'Yes!',
    cancelButtonText: 'No',
  }, (isConfirm) => {
    if (isConfirm) {
      Ladda.create(document.querySelector('#btnDelFindOne')).start();

      const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
      if (doc._id) {
        Communicator.call({
          methodName: 'delete',
          args: { selectedCollection, selector: { _id: doc._id } },
          callback: (err, result) => {
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
          }
        });
      } else {
        toastr.error('Could not find _id of document, delete failed !');
      }
    }
  });
};

Template.browseCollection.onCreated(() => {
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

  Communicator.call({
    methodName: 'checkMongoclientVersion',
    callback: (err, res) => {
      if (res) {
        toastr.info(res, 'Update', { timeOut: 0, extendedTimeOut: 0, preventDuplicates: true });
      }
    }
  });

  init();
});

Template.browseCollection.events({
  'click #btnQueryWizard': function (e) {
    e.preventDefault();
    $('#queryWizardModal').modal('show');
  },

  'click #btnExecutionInfo': function (e) {
    e.preventDefault();
    showQueryInfo();
  },

  'click #btnSaveFindOne': function (e) {
    e.preventDefault();
    saveEditor();
  },

  'click #btnSaveFind': function (e) {
    e.preventDefault();
    saveFindEditor();
  },

  'click #btnDelFindOne': function (e) {
    e.preventDefault();
    deleteDocument();
  },

  'click #btnExportAsCSV': function () {
    Template.find.executeQuery(null, 'CSV');
  },

  'click #btnExportAsJSON': function () {
    Template.find.executeQuery(null, 'JSON');
  },

  'click #btnShowQueryHistories': function () {
    $('#queryHistoriesModal').modal('show');
  },

  'change #cmbQueries': function () {
    cmbQueriesChangeEvent();
  },

  'click #btnSwitchView': function () {
    const jsonViews = $('div[id^="divActiveJsonEditor"]');
    const aceViews = $('div[id^="divActiveAceEditor"]');

    const whichIsDisplayed = getWhichResultViewShowing();

    if (whichIsDisplayed !== 'none') {
      if (whichIsDisplayed === 'jsonEditor') {
        aceViews.each(function () {
          $(this).show('slow');
        });
        jsonViews.each(function () {
          $(this).hide();
        });
      } else {
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
    const queryTemplate = Session.get(Helper.strSessionSelectedQuery);
    if (queryTemplate) {
      Template[queryTemplate].executeQuery();
    } else {
      toastr.warning('Select Query', 'Please select a query first ');
    }
  },
});

Template.browseCollection.helpers({
  getQueryTemplate() {
    return Session.get(Helper.strSessionSelectedQuery);
  },

  getHelpBlockForSelectedQuery() {
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
  },

});
