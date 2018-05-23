import { Communicator } from '/client/imports/facades';
import { Notification, ErrorHandler, UIComponents, SessionManager } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';

const StoredFunctions = function () {};

const saveCallback = function (modal, err, result) {
  if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
  else {
    Notification.success('saved-successfully');
    modal.modal('hide');
    this.init();
  }
};

StoredFunctions.prototype = {
  init(isRefresh) {
    Notification.start('#btnAddNewStoredFunction');

    Communicator.call({
      methodName: 'find',
      args: { selectedCollection: 'system.js' },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          result.result.forEach((obj) => { if (!obj.value.$code) obj.value.$code = ''; });
          UIComponents.DataTable.setupDatatable({
            selectorString: '#tblStoredFunctions',
            data: result.result,
            columns: [
              { data: '_id' },
              { data: 'value.$code', sClass: 'hide_column' },
            ],
            columnDefs: [
              {
                targets: [2],
                data: null,
                width: '5%',
                defaultContent: '<a href="" title="Show/Edit" class="editor_edit"><i class="fa fa-pencil text-navy"></i></a>',
              },
              {
                targets: [3],
                data: null,
                width: '5%',
                defaultContent: '<a href="" title="Delete" class="editor_delete"><i class="fa fa-remove text-navy"></i></a>',
              },
            ]
          });
          if (isRefresh) Notification.success('refreshed-successfully');
        }

        Notification.stop();
      }
    });
  },

  prepareEditModal() {
    const modal = $('#editStoredFunctionModal');
    modal.on('shown.bs.modal', () => {
      const divStoredFunction = $('#divStoredFunction');
      UIComponents.Editor.initializeCodeMirror({ divSelector: divStoredFunction, txtAreaId: 'txtStoredFunction' });
      if (modal.data('selected')) {
        const data = modal.data('selected');
        $('#storedFunctionModalTitle').html(data._id);
        $('#inputStoredFunctionName').val(data._id);
        UIComponents.Editor.setCodeMirrorValue(divStoredFunction, data.value.$code, $('#txtStoredFunction'));
      } else {
        $('#storedFunctionModalTitle').html(Helper.translate({ key: 'add_stored_function' }));
        $('#inputStoredFunctionName').val('');
        UIComponents.Editor.setCodeMirrorValue(divStoredFunction, '', $('#txtStoredFunction'));
      }
    });
  },

  getObjectToSave() {
    const functionVal = UIComponents.Editor.getCodeMirrorValue($('#divStoredFunction'));
    const name = $('#inputStoredFunctionName').val();
    if (!name) {
      Notification.error('name-required');
      return;
    }
    return { value: { $code: functionVal }, _id: name };
  },

  save() {
    const modal = $('#editStoredFunctionModal');
    const objectToSave = this.getObjectToSave();
    const data = modal.data('selected');

    if (!objectToSave) return;

    Notification.start('#btnSaveStoredFunction');
    if (modal.data('selected')) {
      // edit
      Communicator.call({
        methodName: 'updateOne',
        args: { selectedCollection: 'system.js', selector: { _id: data._id }, setObject: { $set: objectToSave } },
        callback: (err, res) => {
          saveCallback.call(this, modal, err, res);
        }
      });
    } else {
      // add
      Communicator.call({
        methodName: 'insertMany',
        args: { selectedCollection: 'system.js', docs: [objectToSave] },
        callback: (err, res) => {
          saveCallback.call(this, modal, err, res);
        }
      });
    }
  },

  delete() {
    const name = SessionManager.get(SessionManager.strSessionSelectedStoredFunction)._id;
    if (name) {
      Notification.modal({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: (isConfirm) => {
          if (isConfirm) {
            Notification.start('#btnAddNewStoredFunction');

            Communicator.call({
              methodName: 'delete',
              args: { selectedCollection: 'system.js', selector: { _id: name } },
              callback: (err, result) => {
                if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
                else {
                  Notification.success('deleted-successfully');
                  this.init();
                }
              }
            });
          }
        }
      });
    }
  }
};

export default new StoredFunctions();
