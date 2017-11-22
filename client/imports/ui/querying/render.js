import { Notification, SessionManager, UIComponents, ErrorHandler, Enums } from '/client/imports/modules';
import { ReactivityProvider, Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';
import { AceEditor } from 'meteor/arch:ace-editor';
import moment from 'moment';

require('jquery-contextmenu');

const JSONEditor = require('jsoneditor');

const QueryRender = function () {
  this.jsonEditor = null;
};

const getEditor = function () {
  if ($('.jsoneditor').length === 0) {
    this.jsonEditor = new JSONEditor(document.getElementById('jsoneditor'), {
      mode: 'tree',
      modes: ['code', 'form', 'text', 'tree', 'view'],
      search: true,
    });
  }
  return this.jsonEditor;
};

QueryRender.prototype = {
  setOptionsComboboxChangeEvent(cmb, sessionVar) {
    cmb.on('change', (evt, params) => {
      const array = SessionManager.get(sessionVar || SessionManager.strSessionSelectedOptions);
      if (params.deselected) array.remove(params.deselected);
      else array.push(params.selected);

      SessionManager.set(sessionVar || SessionManager.strSessionSelectedOptions, array);
    });
  },

  renderAfterQueryExecution(err, result, isAdmin, queryInfo, queryParams, saveHistory) {
    if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't execute query");
    else {
      if (isAdmin) this.setAdminResult(result.result);
      else this.setQueryResult(result.result, queryInfo, queryParams, saveHistory);

      Notification.stop();
    }
  },

  getActiveEditorValue() {
    const resultTabs = $('#resultTabs');
    const resultContents = $('#resultTabContents');

    const whichIsDisplayed = this.getWhichResultViewShowing();
    if (whichIsDisplayed === 'aceEditor') {
      const foundAceEditor = resultContents.find('div.active').find('pre').attr('id');
      if (foundAceEditor) {
        return AceEditor.instance(foundAceEditor).getValue();
      }
    } else if (whichIsDisplayed === 'jsonEditor') {
      const tabId = resultTabs.find('li.active').find('a').attr('href');
      if ($(tabId).data('jsoneditor')) {
        return JSON.stringify($(tabId).data('jsoneditor').get());
      }
    }
  },

  initQueryHistories() {
    Notification.start('#btnExecuteAgain');

    const connectionId = SessionManager.get(SessionManager.strSessionConnection);
    const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
    const queryHistories = ReactivityProvider.find(ReactivityProvider.types.QueryHistory, { connectionId, collectionName: selectedCollection }, { sort: { date: -1 } });

    UIComponents.DataTable.setupDatatable({
      selectorString: '#tblQueryHistories',
      columns: [
        {
          data: 'queryName',
          width: '20%',
        },
        {
          data: 'date',
          width: '20%',
          render(cellData) {
            return moment(cellData).format('YYYY-MM-DD HH:mm:ss');
          },
        },
        {
          data: 'params',
          width: '60%',
          render(cellData) {
            return JSON.stringify(cellData).replace(/\\"/g, '');
          },
        }
      ],
      data: queryHistories,
      autoWidth: false,
      lengthMenu: [3, 5, 10, 20]
    });

    Notification.stop();
  },

  saveQueryHistory(queryInfo, queryParams) {
    if (!queryParams) {
      queryParams = {};
    }

    Communicator.call({
      methodName: 'saveQueryHistory',
      args: {
        history: {
          connectionId: SessionManager.get(SessionManager.strSessionConnection),
          collectionName: SessionManager.get(SessionManager.strSessionSelectedCollection),
          queryName: queryInfo,
          params: JSON.stringify(queryParams),
          date: new Date(),
        }
      }
    });
  },

  setQueryResult(result, queryInfo, queryParams, saveHistory) {
    const jsonEditor = $('#divActiveJsonEditor');
    const aceEditor = $('#divActiveAceEditor');
    const settings = ReactivityProvider.findOne(ReactivityProvider.types.Settings);

    if (jsonEditor.css('display') === 'none' && aceEditor.css('display') === 'none') {
      // there's only one tab, set results
      if (settings.defaultResultView === 'Jsoneditor') {
        jsonEditor.show('slow');
      } else {
        aceEditor.show('slow');
      }
      this.setResultToEditors(1, result, queryParams, queryInfo);
    } else {
      // close all if setting for single tab is enabled
      const resultTabs = $('#resultTabs');
      if (settings.singleTabResultSets) {
        resultTabs.find('li').each((idx, li) => {
          const select = $(li);
          $(select.children('a').attr('href')).remove();
          select.remove();
        });

        $('#divBrowseCollectionFooter').hide();
        $('#divBrowseCollectionFindFooter').hide();
      }

      // open a new tab
      const tabID = this.clarifyTabID();
      const tabContent = this.getResultTabContent(tabID, settings.defaultResultView);
      const tabTitle = `${queryInfo} - ${SessionManager.get(SessionManager.strSessionSelectedCollection)}`;
      this.setAllTabsInactive();

      // set tab href
      resultTabs.append($(`<li><a href="#tab-${tabID}" data-toggle="tab"><i class="fa fa-book"></i>${tabTitle}<button class="close" type="button" title="Close">×</button></a></li>`));

      // set tab content
      $('#resultTabContents').append(tabContent);

      // show last tab
      const lastTab = resultTabs.find('a:last');
      lastTab.tab('show');

      this.setResultToEditors(tabID, result, queryParams, queryInfo);
    }

    if (saveHistory) this.saveQueryHistory(queryInfo, queryParams);
  },

  setAdminResult(result) {
    // set json editor
    getEditor.call(this).set(result);

    // set ace editor
    AceEditor.instance('aceeditor', {
      mode: 'javascript',
      theme: 'dawn',
    }, (editor) => {
      editor.$blockScrolling = Infinity;
      editor.setOptions({
        fontSize: '12pt',
        showPrintMargin: false,
      });
      editor.setValue(JSON.stringify(result, null, '\t'), -1);
    });

    const jsonEditor = $('#divJsonEditor');
    const aceEditor = $('#divAceEditor');
    if (jsonEditor.css('display') === 'none' && aceEditor.css('display') === 'none') {
      const settings = ReactivityProvider.findOne(ReactivityProvider.types.Settings);
      if (settings.defaultResultView === 'Jsoneditor') jsonEditor.show('slow');
      else aceEditor.show('slow');
    }
  },

  setAllTabsInactive() {
    $('#resultTabContents').each(function () {
      const otherTab = $(this);
      otherTab.removeClass('active');
      if (otherTab.find('#divActiveJsonEditor').length !== 0) {
        // set all tabs different IDs to prevent setting result to existing editor.
        const uniqueID = new Date().getTime();
        otherTab.find('#divActiveJsonEditor').attr('id', `divActiveJsonEditor-${uniqueID}`);
        otherTab.find('#activeJsonEditor').attr('id', `activeJsonEditor-${uniqueID}`);
        otherTab.find('#divActiveAceEditor').attr('id', `divActiveAceEditor-${uniqueID}`);
        otherTab.find('#activeAceEditor').attr('id', `activeAceEditor-${uniqueID}`);
      }
    });
  },

  getEditor(tabID) {
    const tabView = $(`#tab-${tabID}`);
    if (!tabView.data('jsoneditor')) {
      const jsonEditor = new JSONEditor(document.getElementById('activeJsonEditor'), {
        mode: 'tree',
        modes: ['code', 'form', 'text', 'tree', 'view'],
        search: true,
      });

      tabView.data('jsoneditor', jsonEditor);
    }

    return tabView.data('jsoneditor');
  },

  setResultToEditors(tabID, result, queryParams, queryInfo) {
    // set json editor
    this.getEditor(tabID).set(result);

    // set ace
    AceEditor.instance('activeAceEditor', {
      mode: 'javascript',
      theme: 'dawn',
    }, (editor) => {
      editor.$blockScrolling = Infinity;
      editor.setOptions({
        fontSize: '12pt',
        showPrintMargin: false,
      });
      editor.setValue(JSON.stringify(result, null, '\t'), -1);
    });

    const activeTab = $(`#tab-${tabID}`);

    // cache query data
    activeTab.data('query', {
      queryInfo,
      queryParams,
    });

    // cache find data for save button
    if (queryInfo === 'find') {
      activeTab.data('findData', result);
    }
  },

  clarifyTabID(sessionKey = SessionManager.strSessionUsedTabIDs) {
    let result = 1;
    let tabIDArray = SessionManager.get(sessionKey);
    if (!tabIDArray || tabIDArray.length === 0) {
      tabIDArray = [result];
      SessionManager.set(sessionKey, tabIDArray);
      return result;
    }

    result = tabIDArray[tabIDArray.length - 1] + 1;

    tabIDArray.push(result);
    SessionManager.set(sessionKey, tabIDArray);
    return result;
  },

  getWhichResultViewShowing() {
    const jsonViews = $('div[id^="divActiveJsonEditor"]');
    const aceViews = $('div[id^="divActiveAceEditor"]');

    let whichIsDisplayed = 'none';
    jsonViews.each(function () {
      if ($(this).css('display') !== 'none') {
        whichIsDisplayed = 'jsonEditor';
      }
    });

    aceViews.each(function () {
      if ($(this).css('display') !== 'none') {
        whichIsDisplayed = 'aceEditor';
      }
    });

    return whichIsDisplayed;
  },

  getResultTabContent(tabID, defaultView) {
    const jsonEditorHtml = `<div class="tab-pane fade in active" id="tab-${tabID}">` +
      '<div id="divActiveJsonEditor" class="form-group"> ' +
      '<div id="activeJsonEditor" style="width: 100%;height:500px" class="col-lg-12"> ' +
      '</div> </div> ' +
      '<div id="divActiveAceEditor" class="form-group" style="display: none"> ' +
      '<div class="col-lg-12"> ' +
      '<pre id="activeAceEditor" style="height: 500px"></pre> ' +
      '</div> </div> </div>';

    const aceEditorHtml = `<div class="tab-pane fade in active" id="tab-${tabID}">` +
      '<div id="divActiveJsonEditor" class="form-group" style="display:none;"> ' +
      '<div id="activeJsonEditor" style="width: 100%;height:500px" class="col-lg-12"> ' +
      '</div> </div> ' +
      '<div id="divActiveAceEditor" class="form-group"> ' +
      '<div class="col-lg-12"> ' +
      '<pre id="activeAceEditor" style="height: 500px"></pre> ' +
      '</div> </div> </div>';

    const whichIsDisplayed = this.getWhichResultViewShowing();
    let result;

    if (whichIsDisplayed === 'none') {
      const defaultIsAce = (defaultView !== 'Jsoneditor');
      if (!defaultIsAce) result = jsonEditorHtml;
      else result = aceEditorHtml;
    } else if (whichIsDisplayed === 'jsonEditor') result = jsonEditorHtml;
    else result = aceEditorHtml;

    return result;
  },

  clearQueryIfAdmin() {
    $.each(Enums.ADMIN_QUERY_TYPES, (key, value) => {
      if (value === SessionManager.get(SessionManager.strSessionSelectedQuery)) {
        SessionManager.set(SessionManager.strSessionSelectedQuery, null);
        SessionManager.set(SessionManager.strSessionSelectedOptions, null);
      }
    });
  },

  cmbQueriesChangeEvent() {
    SessionManager.set(SessionManager.strSessionSelectedOptions, []);

    const value = $('#cmbQueries').find(':selected').text();
    if (value) SessionManager.set(SessionManager.strSessionSelectedQuery, value);

    if (value === Enums.QUERY_TYPES.FIND) {
      $('#btnExportQueryResult').show();
      $('#btnQueryWizard').show();
    } else {
      $('#btnExportQueryResult').hide();
      $('#btnQueryWizard').hide();
    }
  },

  renderQuery(query) {
    if (!query || !query.queryInfo || query.queryInfo === 'rename') {
      return;
    }

    $('#cmbQueries').val((_.invert(Enums.QUERY_TYPES))[query.queryInfo]).trigger('chosen:updated');
    this.cmbQueriesChangeEvent();

    Template[query.queryInfo].renderQuery(query);
  },

  getActiveTabHeader() {
    const text = $('#resultTabs').find('li.active').find('a').text();
    if (text && text.indexOf(' ') !== -1) {
      return text.substring(0, text.indexOf(' '));
    }
  },

  init() {
    Communicator.call({
      methodName: 'checkMongoclientVersion',
      callback: (err, res) => {
        if (res) Notification.info(res, { timeOut: 0, extendedTimeOut: 0, preventDuplicates: true });
      }
    });

    const cmb = $('#cmbQueries');
    cmb.append($("<optgroup id='optGroupCollectionQueries' label='Collection Queries'></optgroup>"));
    const cmbOptGroupCollection = cmb.find('#optGroupCollectionQueries');

    $.each(Helper.sortObjectByKey(Enums.QUERY_TYPES), (key, value) => {
      const option = $('<option></option>')
        .attr('value', key)
        .text(value);
      if (value === Enums.QUERY_TYPES.FIND) option.attr('selected', true);
      cmbOptGroupCollection.append(option);
    });
    cmb.chosen();

    $('#queryHistoriesModal').on('show.bs.modal', () => {
      this.initQueryHistories();
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

            if (this.getActiveTabHeader() !== 'findOne') $('#divBrowseCollectionFooter').hide();
            if (this.getActiveTabHeader() !== 'find') $('#divBrowseCollectionFindFooter').hide();
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
      if (query) this.renderQuery(query);

      // if active tab is not findOne hide save/delete footer
      if (activeTabQueryInfo === 'findOne') $('#divBrowseCollectionFooter').show();
      else $('#divBrowseCollectionFooter').hide();

      // if active tab is not find hide save footer
      if (activeTabQueryInfo === 'find') $('#divBrowseCollectionFindFooter').show();
      else $('#divBrowseCollectionFindFooter').hide();
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

    this.clearQueryIfAdmin();
  },

  switchView() {
    const jsonViews = $('div[id^="divActiveJsonEditor"]');
    const aceViews = $('div[id^="divActiveAceEditor"]');

    const whichIsDisplayed = this.getWhichResultViewShowing();

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
  }
};

export default new QueryRender();
