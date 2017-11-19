import { SessionManager } from '/client/imports/modules';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
import { AceEditor } from 'meteor/arch:ace-editor';

const JSONEditor = require('jsoneditor');

const UIComponentHelper = function () {
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

UIComponentHelper.prototype = {
  saveQueryHistory(queryInfo, queryParams) {
    if (!queryParams) {
      queryParams = {};
    }

    Communicator.call({
      methodName: 'saveQueryHistory',
      args: {
        history: {
          connectionId: SessionManager.get(SessionManager.keys.strSessionConnection),
          collectionName: SessionManager.get(SessionManager.keys.strSessionSelectedCollection),
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
      const tabTitle = `${queryInfo} - ${SessionManager.get(SessionManager.keys.strSessionSelectedCollection)}`;
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

  clarifyTabID(sessionKey = SessionManager.keys.strSessionUsedTabIDs) {
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
  }
};

export default new UIComponentHelper();

