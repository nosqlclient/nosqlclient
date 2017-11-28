import { Querying, SessionManager } from '/client/imports/modules';
import { ReactivityProvider } from '/client/imports/facades';
import $ from 'jquery';
import Helper from '/client/imports/helpers/helper';

const CodeMirror = require('codemirror');

require('datatables.net')(window, $);
require('datatables.net-buttons')(window, $);
require('datatables.net-responsive')(window, $);
require('datatables.net-bs')(window, $);
require('datatables.net-buttons-bs')(window, $);
require('datatables.net-responsive-bs')(window, $);
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
  initICheck(selector) {
    selector.iCheck({
      checkboxClass: 'icheckbox_square-green',
    });
  },

  initializeOptionsCombobox(cmb, enums, sessionKey) {
    $.each(Helper.sortObjectByKey(enums), (key, value) => {
      cmb.append($('<option></option>')
        .attr('value', key)
        .text(value));
    });
    cmb.chosen();
    cmb.on('change', (evt, params) => {
      let array = SessionManager.get(sessionKey);
      if (params.deselected) array = array.filter(item => params.deselected.indexOf(item) === -1);
      else array.push(params.selected);
      SessionManager.set(sessionKey, array);
    });
  },

  initializeCollectionsCombobox() {
    const cmb = $('#cmbCollections');
    cmb.append($("<optgroup id='optGroupCollections' label='Collections'></optgroup>"));
    const cmbOptGroupCollection = cmb.find('#optGroupCollections');

    const collectionNames = SessionManager.get(SessionManager.strSessionCollectionNames);
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
      const self = this;
      selector.DataTable({
        language: self.getDatatableLanguageOptions()
      });
      selector.find('tbody').on('click', 'tr', function () {
        const table = selector.DataTable();
        self.doTableRowSelectable(table, $(this));

        if (table.row(this).data()) {
          if (sessionKey) SessionManager.set(sessionKey, table.row(this).data());
          if (clickCallback) clickCallback(table, table.row(this));
        }
      });

      if (!noDeleteEvent) this.attachDeleteTableRowEvent(selector);
    },

    setupDatatable({ selectorString, columns, columnDefs = [], data, autoWidth = true, lengthMenu = [5, 10, 20] }) {
      const selector = $(selectorString);
      if ($.fn.dataTable.isDataTable(selectorString)) selector.DataTable().destroy();
      selector.DataTable({ language: this.getDatatableLanguageOptions(), responsive: true, destroy: true, stateSave: true, autoWidth, data, columns, columnDefs, lengthMenu });
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

    setCodeMirrorAutoCompletion(method, outList) {
      CodeMirror.hint.javascript = (editor) => {
        const cursor = editor.getCursor();
        const currentLine = editor.getLine(cursor.line);
        let start = cursor.ch;
        let end = start;
        while (end < currentLine.length && /[\w.$]+/.test(currentLine.charAt(end))) end += 1;
        while (start && /[\w.$]+/.test(currentLine.charAt(start - 1))) start -= 1;
        const curWord = (start !== end) && currentLine.slice(start, end);
        const list = method ? method(editor.getValue(), curWord) : outList;
        const regex = new RegExp(`^${curWord}`, 'i');
        return {
          list: (!curWord ? list : list.filter(item => item.match(regex))).sort(),
          from: CodeMirror.Pos(cursor.line, start),
          to: CodeMirror.Pos(cursor.line, end),
        };
      };
    },

    initializeCodeMirror({ divSelector, txtAreaId, keepValue = false, height = 100, noResize = false, extraKeysToAppend = {}, autoCompleteListMethod }) {
      const autoCompleteShortcut = ReactivityProvider.findOne(ReactivityProvider.types.Settings).autoCompleteShortcut || 'Ctrl-Space';
      let codeMirror;
      const extraKeys = Object.assign(extraKeysToAppend, { 'Ctrl-Q': function (cm) { cm.foldCode(cm.getCursor()); } });
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
            SessionManager.set(SessionManager.strSessionSelectorValue, codeMirror.getValue());
          });
        }

        codeMirror.setSize('%100', height);
        this.setCodeMirrorAutoCompletion(autoCompleteListMethod, (SessionManager.get(SessionManager.strSessionDistinctFields) || []));
        divSelector.data('editor', codeMirror);

        if (!noResize) this.doCodeMirrorResizable(codeMirror);
      } else codeMirror = divSelector.data('editor');

      if (keepValue && SessionManager.get(SessionManager.strSessionSelectorValue)) codeMirror.setValue(SessionManager.get(SessionManager.strSessionSelectorValue));

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
    }
  }

};

export default new UIComponents();
