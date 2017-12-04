import { Notification, UIComponents, Enums, ExtendedJSON, ErrorHandler, SessionManager } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';
import { QueryRender } from '/client/imports/ui';
import moment from 'moment';
import QueryingHelper from './helper';

const Aggregate = function () {
  this.stageNumbers = 0;
};

Aggregate.prototype = {
  renderQuery(query) {
    if (!query || !query.queryInfo || !query.queryParams) return;

    $('#stages').empty();
    this.stageNumbers = 0;
    $('#cmbCollections').val(query.queryInfo).trigger('chosen:updated');
    query.queryParams.forEach((stage) => { this.addStageElement(Object.keys(stage)[0], stage[Object.keys(stage)[0]]); });
  },

  setAggregateResult(result, selectedCollection, pipeline) {
    const jsonEditor = $('#divActiveJsonEditor');

    if (jsonEditor.css('display') === 'none') {
      // there's only one tab, set results
      jsonEditor.show('slow');
      UIComponents.setResultToEditors(1, result, pipeline, selectedCollection);
    } else {
      const resultTabs = $('#resultTabs');

      // open a new tab
      const tabID = QueryRender.clarifyTabID(SessionManager.strSessionUsedTabIDsAggregate);
      const tabTitle = `${selectedCollection} - ${pipeline.length} stages`;
      QueryRender.setAllTabsInactive();

      // set tab href
      resultTabs.append($(`<li><a href="#tab-${tabID}" data-toggle="tab"><i class="fa fa-book"></i>${tabTitle}
                            <button class="close" type="button" title="Close">×</button></a></li>`));


      QueryRender.showLastTab(resultTabs, tabID);
      QueryRender.setResultToEditors(tabID, result, pipeline, selectedCollection);
    }

    this.addPipelineToHistory(selectedCollection, pipeline);
  },

  createPipeline(stageListElements) {
    const pipeline = [];
    stageListElements.each(function () {
      const stage = {};

      const liElement = $(this);
      const queryName = liElement.text().split(' ')[0].trim();
      if (liElement.find('[id^=inputNumberStage]').length !== 0) stage[queryName] = parseInt(liElement.find('[id^=inputNumberStage]').val(), 10);
      else if (liElement.find('[id^=wrapper]').data('editor')) {
        // codemirror values
        let jsonValue = liElement.find('[id^=wrapper]').data('editor').getValue();
        if (!liElement.hasClass('$unwind') || (liElement.hasClass('$unwind') && jsonValue.indexOf(':') !== -1)) {
          jsonValue = ExtendedJSON.convertAndCheckJSON(jsonValue);
          if (jsonValue.ERROR) return `${queryName}: ${jsonValue.ERROR}`;
        }

        stage[queryName] = jsonValue;
      } else if (liElement.find('[id^=txtStringStage]').length !== 0) stage[queryName] = liElement.find('[id^=txtStringStage]').val();
      else return queryName;
      pipeline.push(stage);
    });

    return pipeline;
  },

  addStageElement(query, val) {
    const cmb = $('#cmbStageQueries');
    query = query || cmb.chosen().val();
    if (query) {
      query = (query.indexOf('$') !== -1 ? query : `$${query}`);
      let liElement = `<li class="success-element ${query}" id="stage${this.stageNumbers}">${query}
                       <a id="remove-stage-element" href="#" data-number="${this.stageNumbers}" class="pull-right btn btn-xs btn-white">
                       <i class="fa fa-remove"></i> Remove</a><div id="wrapper${this.stageNumbers}" class="agile-detail">`;

      const stringInput = `<input type="text" class="form-control" id="txtStringStage${this.stageNumbers}"/>`;
      const numberInput = `<input id="inputNumberStage${this.stageNumbers}" min="0" type="number" class="form-control"/>`;
      let initCodeMirror; let isNumber;
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
          liElement += `<textarea id="txtObjectStage${this.stageNumbers}" class="form-control"></textarea>`;
          break;
      }

      liElement += '</div> </li>';
      $('#stages').append(liElement);
      if (initCodeMirror) UIComponents.Editor.initializeCodeMirror({ divSelector: $(`#wrapper${this.stageNumbers}`), txtAreaId: `txtObjectStage${this.stageNumbers}`, keepValue: false, height: 50 });

      cmb.val('').trigger('chosen:updated');

      if (val) {
        if (initCodeMirror) UIComponents.Editor.setCodeMirrorValue($(`#wrapper${this.stageNumbers}`), JSON.stringify(val).replace(/^"(.*)"$/, '$1'), $(`#txtObjectStage${this.stageNumbers}`));
        else if (isNumber) $(`#inputNumberStage${this.stageNumbers}`).val(val);
        else $(`#txtStringStage${this.stageNumbers}`).val(val.replace(/^"(.*)"$/, '$1'));
      }

      this.stageNumbers += 1;
    }
  },

  init() {
    this.stageNumbers = 0;
    const resultTabs = $('#resultTabs');
    resultTabs.on('show.bs.tab', (e) => {
      const query = $($(e.target).attr('href')).data('query');
      if (query) {
        this.renderQuery(query);
      }
    });

    // set onclose
    resultTabs.on('click', '.close', function () {
      $(this).parents('li').remove();
      $($(this).parents('a').attr('href')).remove();
    });

    $('#aggregateHistoriesModal').on('shown.bs.modal', () => this.initAggregateHistories());
    QueryingHelper.initializeTabContextMenu();
  },

  execute() {
    const selectedCollection = $('#cmbCollections').chosen().val();
    const stages = $('#stages').find('li');
    if (!selectedCollection) {
      Notification.warning('select_collection');
      return;
    }

    if (stages.length === 0) {
      Notification.warning('one-stage-required');
      return;
    }

    Notification.start('#btnExecuteAggregatePipeline');

    const pipeline = this.createPipeline(stages);
    if (Object.prototype.toString.call(pipeline) !== '[object Array]') {
      Notification.error('stage-error', null, { error: pipeline });
      return;
    }

    Communicator.call({
      methodName: 'aggregate',
      args: { selectedCollection, pipeline },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else this.setAggregateResult(result.result, selectedCollection, pipeline);

        Notification.stop();
      }
    });
  },

  addPipelineToHistory(collection, pipeline) {
    let oldOnes = localStorage.getItem(Enums.LOCAL_STORAGE_KEYS.AGGREGATE_COMMAND_HISTORY) || '[]';
    if (oldOnes) oldOnes = JSON.parse(oldOnes);
    if (oldOnes.length >= 50) oldOnes.splice(0, oldOnes.length - 19);

    oldOnes.push({ pipeline, collection, date: new Date() });
    localStorage.setItem(Enums.LOCAL_STORAGE_KEYS.AGGREGATE_COMMAND_HISTORY, JSON.stringify(oldOnes));
  },

  initAggregateHistories() {
    Notification.start('#btnUseHistoricalPipeline');

    UIComponents.DataTable.setupDatatable({
      autoWidth: false,
      selectorString: '#tblAggregateHistories',
      columns: [
        {
          data: 'collection',
          width: '20%',
        },
        {
          data: 'pipeline',
          width: '60%',
          render(cellData) {
            let str = '';
            cellData.forEach((stage) => { str += `${Object.keys(stage)[0]}<br/>`; });
            return str;
          },
        },
        {
          data: 'date',
          width: '20%',
          render(cellData) {
            return moment(cellData).format('YYYY-MM-DD HH:mm:ss');
          },
        },
      ],
      lengthMenu: [5, 10, 20],
      data: JSON.parse(localStorage.getItem(Enums.LOCAL_STORAGE_KEYS.AGGREGATE_COMMAND_HISTORY) || '[]')
    });

    Notification.stop();
  }
};

export default new Aggregate();
