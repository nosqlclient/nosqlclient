import { SessionManager } from '/client/imports/modules';
import { ReactivityProvider } from '/client/imports/facades';
import $ from 'jquery';
import Helper from '/client/imports/helpers/helper';
import { QueryRender } from '../../ui/querying';

const CodeMirror = require('codemirror');
const JSONEditor = require('jsoneditor');
const Ace = require('brace');

require('brace/mode/json');
require('brace/theme/github');
require('brace/worker/json');
require('datatables.net')(window, $);
require('datatables.net-buttons')(window, $);
require('datatables.net-responsive')(window, $);
require('datatables.net-bs')(window, $);
require('datatables.net-buttons-bs')(window, $);
require('datatables.net-responsive-bs')(window, $);
require('codemirror/mode/javascript/javascript.js');
require('codemirror/addon/fold/brace-fold.js');
require('codemirror/addon/fold/comment-fold.js');
require('codemirror/addon/fold/foldcode.js');
require('codemirror/addon/fold/foldgutter.js');
require('codemirror/addon/fold/indent-fold.js');
require('codemirror/addon/fold/markdown-fold.js');
require('codemirror/addon/fold/xml-fold.js');
require('codemirror/addon/hint/javascript-hint.js');
require('codemirror/addon/hint/show-hint.js');

const collectAllKeys = function (value) {
  const allKeys = new Set();
  value.forEach((row) => {
    Object.keys(row).forEach(k => allKeys.add(k));
  });
  if (allKeys.size === 0) {
    allKeys.add('(empty)');
  }
  return allKeys;
};

const quoteAttr = function (s) {
  return `${s}` /* Forces the conversion to string. */
    .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
    .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r\n/g, '&#13;') /* Must be before the next replacement. */
    .replace(/[\r\n]/g, '&#13;');
};

const convertObjectToGridRow = function (obj, allKeys) {
  let html = '<tr>';
  allKeys.forEach((key) => {
    let val = obj[key];
    if (typeof val === 'undefined') val = '';
    if (val !== null && typeof val === 'object') {
      const valKeys = Object.keys(val);
      if (valKeys.length === 1 && valKeys[0] === '$date') {
        val = val.$date;
      } else {
        val = JSON.stringify(val);
      }
    }
    val = `${val}`;
    if (val.length > 50) {
      html += `<td title="${quoteAttr(val)}">${val.substr(0, 47)}...</td>`;
    } else {
      html += `<td>${val}</td>`;
    }
  });
  html += '</tr>';
  return html;
};

const displayJsonEditorModal = function (sData) {
  let modal = $('#json-editor-modal');
  if (modal.length === 0) {
    modal = $('<div class="modal fade" id="json-editor-modal" tabindex="-1" role="dialog">'
      + '  <div class="modal-dialog" role="document">\n'
      + '    <div class="modal-content">'
      + '    <div class="modal-header">'
      + '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
      + '        <h4 class="modal-title">Cell data</h4>'
      + '    </div>'
      + '      <div class="modal-body" id="json-editor-modal-data" style="height: calc(100vh - 100px)"></div>'
      + '    </div>'
      + '  </div>'
      + '</div>');
    $('body').append(modal);

    this.initializeJSONEditor({
      selector: 'json-editor-modal-data',
      options: {
        mode: 'code',
        modes: ['code', 'view'],
        readOnly: true
      }
    });
  }
  modal.modal();
  $('#json-editor-modal-data').data('jsoneditor').set(JSON.parse(sData));
};

const doCodeMirrorResizable = function (codeMirror) {
  $('.CodeMirror').resizable({
    resize() {
      codeMirror.setSize($(this).width(), $(this).height());
    },
  });
};

const getGridEditorHtml = function (value) {
  const allKeys = collectAllKeys(value);

  let html = '<table class="table table-bordered"><thead><tr>';
  allKeys.forEach((key) => { html += `<th>${key}</th>`; });
  html += '</tr></thead><tbody>';
  value.forEach((row) => { html += convertObjectToGridRow(row, allKeys); });
  html += '</tbody></table>';

  return html;
};

const gatherExtraKeysForCodeMirror = function (extraKeysToAppend = {}) {
  const extraKeys = Object.assign(extraKeysToAppend, {
    'Ctrl-Q': function (cm) {
      cm.foldCode(cm.getCursor());
    },
    'Ctrl-Enter': function () {
      QueryRender.executeQuery();
    }
  });

  const autoCompleteShortcut = ReactivityProvider.findOne(ReactivityProvider.types.Settings).autoCompleteShortcut || 'Ctrl-Space';
  extraKeys[autoCompleteShortcut] = 'autocomplete';

  return extraKeys;
};

const setAutoCompletionOfCodeMirror = function (autoCompleteListMethod) {
  CodeMirror.hint.javascript = (editor) => {
    const cursor = editor.getCursor();
    const currentLine = editor.getLine(cursor.line);
    let start = cursor.ch;
    let end = start;
    while (end < currentLine.length && /[\w.$]+/.test(currentLine.charAt(end))) end += 1;
    while (start && /[\w.$]+/.test(currentLine.charAt(start - 1))) start -= 1;
    const curWord = (start !== end) && currentLine.slice(start, end);
    const list = autoCompleteListMethod ? autoCompleteListMethod(editor.getValue(), curWord) : SessionManager.get(SessionManager.strSessionDistinctFields) || [];
    const regex = new RegExp(`^${curWord}`, 'i');
    return {
      list: (!curWord ? list : list.filter(item => item.match(regex))).sort(),
      from: CodeMirror.Pos(cursor.line, start),
      to: CodeMirror.Pos(cursor.line, end),
    };
  };
};

const initializeCodeMirrorFirstTime = function (txtAreaId, extraKeysToAppend, keepValue, height, autoCompleteListMethod, noResize) {
  const codeMirror = CodeMirror.fromTextArea(document.getElementById(txtAreaId), {
    mode: 'javascript',
    theme: 'neat',
    styleActiveLine: true,
    lineNumbers: true,
    lineWrapping: false,
    extraKeys: gatherExtraKeysForCodeMirror(extraKeysToAppend),
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
  });

  if (keepValue) {
    codeMirror.on('change', () => {
      SessionManager.set(SessionManager.strSessionSelectorValue, codeMirror.getValue());
    });
  }

  codeMirror.setSize('%100', height);
  setAutoCompletionOfCodeMirror(autoCompleteListMethod);

  if (!noResize) doCodeMirrorResizable(codeMirror);
  return codeMirror;
};

const UIComponents = function () {};

UIComponents.prototype = {
  DataTable: {
    attachDeleteTableRowEvent(selector) {
      if (!selector || !(selector instanceof $) || selector.find('tbody').length === 0) return;

      selector.find('tbody').on('click', 'a.editor_delete', function () {
        selector.DataTable().row($(this).parents('tr')).remove().draw();
      });
    },

    toggleDatatableRowSelection(table, row) {
      if (!row || !(row instanceof $) || !$.fn.DataTable.isDataTable(table)) return;

      if (row.hasClass('selected')) row.removeClass('selected');
      else {
        table.$('tr.selected').removeClass('selected');
        row.addClass('selected');
      }
    },

    getDatatableLanguageOptions() {
      return {
        emptyTable: Helper.translate({ key: 'emptyTable' }),
        info: Helper.translate({ key: 'info' }),
        infoEmpty: Helper.translate({ key: 'infoEmpty' }),
        infoFiltered: Helper.translate({ key: 'infoFiltered' }),
        infoPostFix: Helper.translate({ key: 'infoPostFix' }),
        thousands: Helper.translate({ key: 'thousands' }),
        lengthMenu: Helper.translate({ key: 'lengthMenu' }),
        loadingRecords: Helper.translate({ key: 'loadingRecords' }),
        processing: Helper.translate({ key: 'processing' }),
        search: Helper.translate({ key: 'dt_search' }),
        zeroRecords: Helper.translate({ key: 'zeroRecords' }),
        paginate: {
          first: Helper.translate({ key: 'first' }),
          last: Helper.translate({ key: 'last' }),
          next: Helper.translate({ key: 'next' }),
          previous: Helper.translate({ key: 'previous' })
        },
        aria: {
          sortAscending: Helper.translate({ key: 'sortAscending' }),
          sortDescending: Helper.translate({ key: 'sortDescending' })
        }
      };
    },

    initiateDatatable({ selector, sessionKey, clickCallback, noDeleteEvent }) {
      if (!selector || !(selector instanceof $)) return;
      if (clickCallback && typeof clickCallback !== 'function') return;

      const self = this;
      selector.DataTable({
        language: self.getDatatableLanguageOptions()
      });

      selector.find('tbody').on('click', 'tr', function () {
        const table = selector.DataTable();

        self.toggleDatatableRowSelection(table, $(this));
        const row = table.row(this);
        const data = row.data();

        if (data) {
          if (sessionKey) SessionManager.set(sessionKey, data);
          if (clickCallback) clickCallback(table, row);
        }
      });

      if (!noDeleteEvent) this.attachDeleteTableRowEvent(selector);
    },

    // dynamically creates a datatable.
    setupDatatable({ selectorString, columns, columnDefs = [], data, extraOptions = {}, autoWidth = true, lengthMenu = [5, 10, 20] }) {
      if (!selectorString || !Array.isArray(columns) || !Array.isArray(columnDefs) || !Array.isArray(data) || !Array.isArray(lengthMenu) || (typeof extraOptions !== 'object')) { return; }

      const selector = $(selectorString);
      if ($.fn.dataTable.isDataTable(selectorString)) selector.DataTable().destroy();
      selector.DataTable(Object.assign(extraOptions, {
        language: this.getDatatableLanguageOptions(),
        responsive: true,
        destroy: true,
        stateSave: true,
        autoWidth,
        data,
        columns,
        columnDefs,
        lengthMenu
      })).draw();
    }
  },

  Editor: {
    getAceEditorValue(selector) {
      const editor = Ace.edit(selector);
      if (!editor) return '';

      return editor.getValue();
    },

    setAceEditorValue({ selector, value }) {
      const editor = Ace.edit(selector);
      if (!editor) return;

      editor.setTheme('ace/theme/github');
      editor.session.setMode('ace/mode/json');
      editor.$blockScrolling = Infinity;
      editor.setOptions({
        fontSize: '14px',
        showLineNumbers: true,
        showPrintMargin: false
      });
      editor.setValue(JSON.stringify(value, null, '\t'), -1);
    },

    setGridEditorValue({ selector, value }) {
      if (!selector) return;
      if (!Array.isArray(value)) value = [value];

      const container = $(`#${selector}`);
      container.html(getGridEditorHtml(value));

      const table = container.find('table');
      table.DataTable({
        paging: false
      });
      const self = this;
      table.on('dblclick', 'td[title]', function () {
        displayJsonEditorModal.call(self, this.getAttribute('title'));
      });
    },

    initializeJSONEditor({ selector, options = {}, setDivData = true }) {
      if (!selector) return;

      const editorDiv = $(`#${selector}`);
      let jsonEditor = editorDiv.data('jsoneditor');
      if (!jsonEditor) {
        jsonEditor = new JSONEditor(document.getElementById(selector), Object.assign({
          mode: 'tree',
          modes: ['code', 'form', 'text', 'tree', 'view'],
          search: true,
        }, options));

        if (setDivData) editorDiv.data('jsoneditor', jsonEditor);
      }

      return jsonEditor;
    },

    initializeCodeMirror({ divSelector, txtAreaId, keepValue = false, height = 100, noResize = false, extraKeysToAppend = {}, autoCompleteListMethod }) {
      if (!divSelector || !(divSelector instanceof $) || !txtAreaId) return;
      if (autoCompleteListMethod && typeof autoCompleteListMethod !== 'function') return;
      if (extraKeysToAppend && (typeof extraKeysToAppend !== 'object' || extraKeysToAppend.constructor !== Object)) return;
      if (!height || typeof height !== 'number' || !Number.isFinite(height)) return;

      let codeMirror = divSelector.data('editor');
      if (!codeMirror) {
        codeMirror = initializeCodeMirrorFirstTime(txtAreaId, extraKeysToAppend, keepValue, height, autoCompleteListMethod, noResize);
        divSelector.data('editor', codeMirror);
      }

      const selectorValue = SessionManager.get(SessionManager.strSessionSelectorValue);
      if (keepValue && selectorValue) codeMirror.setValue(selectorValue);
      codeMirror.refresh();
    },

    setCodeMirrorValue(divSelector, val, txtSelector) {
      if (divSelector && !(divSelector instanceof $)) return;
      if (txtSelector && !(txtSelector instanceof $)) return;

      const codeMirror = divSelector ? divSelector.data('editor') : null;
      if (codeMirror) codeMirror.setValue(val);
      else if (txtSelector) txtSelector.val(val);
    },

    getCodeMirrorValue(divSelector) {
      if (!divSelector || !(divSelector instanceof $)) return '';

      const codeMirror = divSelector.data('editor');
      if (codeMirror) return codeMirror.getValue();
      return '';
    }
  },

  Checkbox: {
    states: ['check', 'uncheck', 'enable', 'disable'],

    init(selector, withState) {
      selector.iCheck({
        checkboxClass: 'icheckbox_square-green',
      });
      if (withState && this.states.indexOf(withState) !== -1) {
        selector.iCheck(withState);
      }
    },

    getState(selector) {
      return selector.iCheck('update')[0].checked;
    },

    toggleState(selector, state) {
      if (this.states.indexOf(state) === -1) return;
      selector.iCheck(state);
    }
  },

  Combobox: {
    init({
      selector, data, empty = true,
      options = { create_option: true, allow_single_deselect: true, persistent_create_option: true, skip_no_results: true },
      sortDataByKey = true,
      prependOptions,
      comboGroupLabel }) {
      if (empty) {
        selector.empty();
        selector.prepend("<option value=''></option>");
      }

      if (prependOptions) selector.append(prependOptions);

      let optionsWrapper = selector;
      if (comboGroupLabel) {
        selector.append($(`<optgroup id="optGroup" label="${comboGroupLabel}"></optgroup>`));
        optionsWrapper = selector.find('#optGroup');
      }

      if (data) {
        $.each((sortDataByKey ? Helper.sortObjectByKey(data) : data), (key, value) => {
          optionsWrapper.append($('<option></option>')
            .attr('value', key)
            .text(value));
        });
      }

      selector.chosen(options);
      selector.trigger('chosen:updated');
    },

    initializeOptionsCombobox(selector, optionEnum, sessionKey) {
      this.init({ selector, data: optionEnum, options: {} });
      this.setOptionsComboboxChangeEvent(selector, sessionKey);
    },

    setOptionsComboboxChangeEvent(cmb, sessionKey = SessionManager.strSessionSelectedOptions) {
      cmb.on('change', (evt, params) => {
        let array = SessionManager.get(sessionKey) || [];
        if (params.deselected) array = array.filter(item => params.deselected.indexOf(item) === -1);
        else array.push(params.selected);

        SessionManager.set(sessionKey, array);
      });
    },

    initializeCollectionsCombobox(selector) {
      const collectionNames = SessionManager.get(SessionManager.strSessionCollectionNames);
      const data = Helper.populateComboboxData(collectionNames, 'name');
      this.init({ selector, data, sortDataByKey: false, comboGroupLabel: 'Collections' });
    },

    deselectAll(selector) {
      selector.find('option').prop('selected', false).trigger('chosen:updated');
    }
  }
};

export default new UIComponents();
