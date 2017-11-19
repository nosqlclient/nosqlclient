import { Querying, SessionManager, Notification, ErrorHandler } from '/client/imports/modules';
import { ReactivityProvider } from '/client/imports/facades';
import { AceEditor } from 'meteor/arch:ace-editor';
import { Blaze } from 'meteor/blaze';
import UIComponentsHelper from './helper';

const CodeMirror = require('codemirror');

require('/node_modules/codemirror/mode/javascript/javascript.js');
require('/node_modules/codemirror/addon/fold/brace-fold.js');
require('/node_modules/codemirror/addon/fold/comment-fold.js');
require('/node_modules/codemirror/addon/fold/foldcode.js');
require('/node_modules/codemirror/addon/fold/foldgutter.js');
require('/node_modules/codemirror/addon/fold/indent-fold.js');
require('/node_modules/codemirror/addon/fold/markdown-fold.js');
require('/node_modules/codemirror/addon/fold/xml-fold.js');
require('/node_modules/codemirror/addon/hint/javascript-hint.js');
require('/node_modules/codemirror/addon/hint/show-hint.js');

const UIComponents = function () {};

UIComponents.prototype = {
  getParentTemplateName(levels = 1) {
    let view = Blaze.currentView;
    while (view) {
      levels -= 1;
      if (view.name.indexOf('Template.') !== -1 && !levels) {
        return view.name.substring(view.name.indexOf('.') + 1);
      }
      view = view.parentView;
    }
  },

  changeRunOnAdminOptionVisibility(show) {
    if (show) {
      $('#aRunOnAdminDB').show();
    } else {
      $('#aRunOnAdminDB').hide();
    }
  },

  initializeCollectionsCombobox() {
    const cmb = $('#cmbCollections');
    cmb.append($("<optgroup id='optGroupCollections' label='Collections'></optgroup>"));
    const cmbOptGroupCollection = cmb.find('#optGroupCollections');

    const collectionNames = SessionManager.get(SessionManager.keys.strSessionCollectionNames);
    $.each(collectionNames, (index, value) => {
      cmbOptGroupCollection.append($('<option></option>')
        .attr('value', value.name)
        .text(value.name));
    });
    cmb.chosen();

    cmb.on('change', (evt, params) => {
      const selectedCollection = params.selected;
      if (selectedCollection) Querying.getDistinctKeysForAutoComplete(selectedCollection);
    });
  },

  renderAfterQueryExecution(err, result, isAdmin, queryInfo, queryParams, saveHistory) {
    if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't execute query");
    else {
      if (isAdmin) UIComponentsHelper.setAdminResult(result.result);
      else UIComponentsHelper.setQueryResult(result.result, queryInfo, queryParams, saveHistory);

      Notification.stop();
    }
  },

  clearQueryIfAdmin() {
    $.each(this.ADMIN_QUERY_TYPES, (key, value) => {
      if (value === SessionManager.get(SessionManager.keys.strSessionSelectedQuery)) {
        SessionManager.set(SessionManager.keys.strSessionSelectedQuery, null);
        SessionManager.set(SessionManager.keys.strSessionSelectedOptions, null);
      }
    });
  },

  getActiveEditorValue() {
    const resultTabs = $('#resultTabs');
    const resultContents = $('#resultTabContents');

    const whichIsDisplayed = UIComponentsHelper.getWhichResultViewShowing();
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

  DataTable: {
    attachDeleteTableRowEvent(selector) {
      selector.find('tbody').on('click', 'a.editor_delete', function () {
        selector.DataTable().row($(this).parents('tr')).remove().draw();
      });
    },

    doTableRowSelectable(table, row) {
      if (row.hasClass('selected')) {
        row.removeClass('selected');
      } else {
        table.$('tr.selected').removeClass('selected');
        row.addClass('selected');
      }
    },

    initiateDatatable(selector, sessionKey, noDeleteEvent) {
      selector.find('tbody').on('click', 'tr', function () {
        const table = selector.DataTable();
        if ($(this).hasClass('selected')) {
          $(this).removeClass('selected');
        } else {
          table.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
        }

        if (table.row(this).data() && sessionKey) {
          SessionManager.set(sessionKey, table.row(this).data());
        }
      });

      if (!noDeleteEvent) this.attachDeleteTableRowEvent(selector);
    }
  },

  Editor: {
    doCodeMirrorResizable(codeMirror) {
      $('.CodeMirror').resizable({
        resize() {
          codeMirror.setSize($(this).width(), $(this).height());
        },
      });
    },

    initializeCodeMirror(divSelector, txtAreaId, keepValue, height = 100, noResize) {
      const autoCompleteShortcut = ReactivityProvider.findOne(ReactivityProvider.types.Settings).autoCompleteShortcut || 'Ctrl-Space';
      let codeMirror;
      const extraKeys = {
        'Ctrl-Q': function (cm) {
          cm.foldCode(cm.getCursor());
        },
      };
      extraKeys[autoCompleteShortcut] = 'autocomplete';

      if (!divSelector.data('editor')) {
        codeMirror = CodeMirror.fromTextArea(document.getElementById(txtAreaId), {
          mode: 'javascript',
          theme: 'neat',
          styleActiveLine: true,
          lineNumbers: true,
          lineWrapping: false,
          extraKeys,
          foldGutter: true,
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        });

        if (keepValue) {
          codeMirror.on('change', () => {
            SessionManager.set(SessionManager.keys.strSessionSelectorValue, codeMirror.getValue());
          });
        }

        codeMirror.setSize('%100', height);

        CodeMirror.hint.javascript = (editor) => {
          const list = SessionManager.get(SessionManager.keys.strSessionDistinctFields) || [];
          const cursor = editor.getCursor();
          const currentLine = editor.getLine(cursor.line);
          let start = cursor.ch;
          let end = start;
          while (end < currentLine.length && /[\w.$]+/.test(currentLine.charAt(end))) end += 1;
          while (start && /[\w.$]+/.test(currentLine.charAt(start - 1))) start -= 1;
          const curWord = (start !== end) && currentLine.slice(start, end);
          const regex = new RegExp(`^${curWord}`, 'i');
          return {
            list: (!curWord ? list : list.filter(item => item.match(regex))).sort(),
            from: CodeMirror.Pos(cursor.line, start),
            to: CodeMirror.Pos(cursor.line, end),
          };
        };

        divSelector.data('editor', codeMirror);

        if (!noResize) this.doCodeMirrorResizable(codeMirror);
      } else {
        codeMirror = divSelector.data('editor');
      }

      if (keepValue && SessionManager.get(SessionManager.keys.strSessionSelectorValue)) {
        codeMirror.setValue(SessionManager.get(SessionManager.keys.strSessionSelectorValue));
      }

      codeMirror.refresh();
    },

    setCodeMirrorValue(divSelector, val, txtSelector) {
      if (divSelector.data('editor')) {
        divSelector.data('editor').setValue(val);
      } else if (txtSelector) {
        txtSelector.val(val);
      }
    },

    getCodeMirrorValue(divSelector) {
      if (divSelector.data('editor')) {
        return divSelector.data('editor').getValue();
      }
      return '';
    },

    getSelectorValue() {
      return this.getCodeMirrorValue($('#divSelector'));
    }
  }

};

export default new UIComponents();
