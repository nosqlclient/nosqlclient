import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Communicator } from '/client/imports/facades';
import Enums from '/lib/imports/enums';
import {
  clarifyTabID,
  getResultTabContent,
  setAllTabsInactive,
  setResultToEditors,
} from '/client/imports/views/pages/browse_collection/browse_collection';
import Helper from '/client/imports/helpers/helper';
import './aggregate_pipeline.html';
import { initAggregateHistories } from './aggregate_histories/aggregate_histories';

const toastr = require('toastr');
const Ladda = require('ladda');

/**
 * Created by RSercan on 14.5.2016.
 */
let stageNumbers = 0;

export const renderQuery = function (query) {
  if (!query || !query.queryInfo || !query.queryParams) return;

  $('#stages').empty();
  stageNumbers = 0;
  $('#cmbCollections').val(query.queryInfo).trigger('chosen:updated');
  for (const stage of query.queryParams) {
    addStageElement(Object.keys(stage)[0], stage[Object.keys(stage)[0]]);
  }
};

const setAggregateResult = function (result, selectedCollection, pipeline) {
  const jsonEditor = $('#divActiveJsonEditor');

  if (jsonEditor.css('display') == 'none') {
    // there's only one tab, set results
    jsonEditor.show('slow');
    setResultToEditors(1, result, pipeline, selectedCollection);
  } else {
    const resultTabs = $('#resultTabs');

    // open a new tab
    const tabID = clarifyTabID(Helper.strSessionUsedTabIDsAggregate);
    const tabContent = getResultTabContent(tabID, 'Jsoneditor');
    const tabTitle = `${selectedCollection} - ${pipeline.length} stages`;
    setAllTabsInactive();

    // set tab href
    resultTabs.append($(`<li><a href="#tab-${tabID}" data-toggle="tab"><i class="fa fa-book"></i>${tabTitle
    }<button class="close" type="button" title="Close">×</button></a></li>`));

    // set tab content
    $('#resultTabContents').append(tabContent);

    // show last tab
    const lastTab = resultTabs.find('a:last');
    lastTab.tab('show');

    setResultToEditors(tabID, result, pipeline, selectedCollection);
  }

  addPipelineToHistory(selectedCollection, pipeline);
};

const addPipelineToHistory = function (collection, pipeline) {
  let oldOnes = localStorage.getItem(Enums.LOCAL_STORAGE_KEYS.AGGREGATE_COMMAND_HISTORY) || '[]';
  if (oldOnes) oldOnes = JSON.parse(oldOnes);
  if (oldOnes.length >= 20) oldOnes.splice(0, oldOnes.length - 19);

  oldOnes.push({ pipeline, collection, date: new Date() });
  localStorage.setItem(Enums.LOCAL_STORAGE_KEYS.AGGREGATE_COMMAND_HISTORY, JSON.stringify(oldOnes));
};

const init = function () {
  const resultTabs = $('#resultTabs');
  resultTabs.on('show.bs.tab', (e) => {
    const query = $($(e.target).attr('href')).data('query');
    if (query) {
      renderQuery(query);
    }
  });

  // set onclose
  resultTabs.on('click', '.close', function () {
    $(this).parents('li').remove();
    $($(this).parents('a').attr('href')).remove();
  });

  $('#aggregateHistoriesModal').on('shown.bs.modal', () => {
    initAggregateHistories();
  });

  $.contextMenu({
    selector: '#resultTabs li',
    items: {
      close_others: {
        name: 'Close Others',
        icon: 'fa-times-circle',
        callback() {
          const tabId = $(this).children('a').attr('href');
          const resultTabsLi = $('#resultTabs').find('li');
          resultTabsLi.each((idx, li) => {
            const select = $(li);
            if (select.children('a').attr('href') !== tabId) {
              $(select.children('a').attr('href')).remove();
              select.remove();
            }
          });
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
        },
      },
    },
  });
};

const initCodeMirrorStage = function () {
  Helper.initializeCodeMirror($(`#wrapper${stageNumbers}`), `txtObjectStage${stageNumbers}`, false, 50);
};

const addStageElement = function (query, val) {
  const cmb = $('#cmbStageQueries');
  query = query || cmb.chosen().val();
  if (query) {
    query = (query.indexOf('$') !== -1 ? query : `$${query}`);
    let liElement = `<li class="success-element ${query}" id="stage${stageNumbers}">${query}<a id="remove-stage-element" href="#" data-number="${stageNumbers}" class="pull-right btn btn-xs btn-white"><i class="fa fa-remove"></i> Remove</a><div id="wrapper${stageNumbers}" class="agile-detail">`;

    const stringInput = `<input type="text" class="form-control" id="txtStringStage${stageNumbers}"/>`;
    const numberInput = `<input id="inputNumberStage${stageNumbers}" min="0" type="number" class="form-control">`;
    let initCodeMirror,
      isNumber;
    switch (query) {
      case '$limit':
        liElement += numberInput;
        isNumber = true;
        break;
      case '$skip':
        liElement += numberInput;
        isNumber = true;
        break;
      case '$out':
        liElement += stringInput;
        break;
      case '$sortByCount':
        liElement += stringInput;
        break;
      case '$count':
        liElement += stringInput;
        break;
      default:
        initCodeMirror = true;
        liElement += `<textarea id="txtObjectStage${stageNumbers}" class="form-control"></textarea>`;
        break;
    }

    liElement += '</div> </li>';
    $('#stages').append(liElement);
    if (initCodeMirror) initCodeMirrorStage();

    cmb.val('').trigger('chosen:updated');

    if (val) {
      if (initCodeMirror) Helper.setCodeMirrorValue($(`#wrapper${stageNumbers}`), JSON.stringify(val).replace(/^"(.*)"$/, '$1'), $(`#txtObjectStage${stageNumbers}`));
      else if (isNumber) $(`#inputNumberStage${stageNumbers}`).val(val);
      else $(`#txtStringStage${stageNumbers}`).val(val.replace(/^"(.*)"$/, '$1'));
    }

    stageNumbers++;
  }
};

const createPipeline = function (stageListElements) {
  const pipeline = [];
  stageListElements.each(function () {
    const stage = {};

    const liElement = $(this);
    const queryName = liElement.text().split(' ')[0].trim();
    if (liElement.find('[id^=inputNumberStage]').length != 0) {
      // number values
      stage[queryName] = parseInt(liElement.find('[id^=inputNumberStage]').val());
    } else if (liElement.find('[id^=wrapper]').data('editor')) {
      // codemirror values
      let jsonValue = liElement.find('[id^=wrapper]').data('editor').getValue();
      if (!liElement.hasClass('$unwind') || (liElement.hasClass('$unwind') && jsonValue.indexOf(':') !== -1)) {
        jsonValue = Helper.convertAndCheckJSON(jsonValue);
        if (jsonValue.ERROR) throw `${queryName} error: ${jsonValue.ERROR}`;
      }

      stage[queryName] = jsonValue;
    } else if (liElement.find('[id^=txtStringStage]').length != 0) {
      // string values
      stage[queryName] = liElement.find('[id^=txtStringStage]').val();
    } else {
      throw queryName;
    }
    pipeline.push(stage);
  });

  return pipeline;
};

Template.aggregatePipeline.onRendered(function () {
  if (Session.get(Helper.strSessionCollectionNames) == undefined) {
    FlowRouter.go('/databaseStats');
    return;
  }

  const settings = this.subscribe('settings');
  const connections = this.subscribe('connections');

  this.autorun(() => {
    if (connections.ready() && settings.ready()) {
      $('#stages').sortable({
        connectWith: '.connectList',
      });

      $('#cmbStageQueries').chosen();
      stageNumbers = 0;
      Helper.initializeCollectionsCombobox();
      init();
    }
  });
});

Template.aggregatePipeline.events({
  'click #btnAggregateHistory': function () {
    $('#aggregateHistoriesModal').modal('show');
  },

  'click #btnExecuteAggregatePipeline': function (e) {
    e.preventDefault();

    const selectedCollection = $('#cmbCollections').chosen().val();
    const stages = $('#stages').find('li');
    if (!selectedCollection) {
      toastr.warning('Please select a collection first !');
      return;
    }

    if (stages.length === 0) {
      toastr.warning('At least one stage is required !');
      return;
    }

    Ladda.create(document.querySelector('#btnExecuteAggregatePipeline')).start();

    let pipeline;
    try {
      pipeline = createPipeline(stages);
    } catch (e) {
      toastr.error(`One of the stages has error: ${e}`);
      Ladda.stopAll();
      return;
    }

    Communicator.call({
      methodName: 'aggregate',
      args: { selectedCollection, pipeline },
      callback: (err, result) => {
        if (err || result.error) {
          Helper.showMeteorFuncError(err, result, "Couldn't execute ");
        } else {
          setAggregateResult(result.result, selectedCollection, pipeline);
          // setResult(result.result);
          // $('#aggregateResultModal').modal('show');
        }

        Ladda.stopAll();
      }
    });
  },

  'change #cmbStageQueries': function () {
    addStageElement();
  },

  'click #remove-stage-element': function (e) {
    e.preventDefault();
    const stageId = `#stage${$(e.target).data('number')}`;
    $(stageId).remove();
  },
});
