import { Notification, ErrorHandler, UIComponents, SessionManager, ExtendedJSON } from '/client/imports/modules';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';
import CollectionHelper from './helper';

const CollectionValidationRules = function () {};

CollectionValidationRules.prototype = {
  resetForm() {
    const divValidator = $('#divValidator');
    const comboBoxes = $('#cmbValidationAction, #cmbValidationLevel');

    UIComponents.Editor.initializeCodeMirror({ divSelector: divValidator, txtAreaId: 'txtValidator' });
    UIComponents.Editor.setCodeMirrorValue(divValidator, '', $('#txtValidator'));
    $('#spanCollectionNameValidationRules').html(`${Helper.translate({ key: 'mongodb_version_warning', options: { version: '3.2' } })}<br/>${$('#validationRulesModal').data('collection')}`);
    UIComponents.Combobox.init({ selector: comboBoxes, options: {}, empty: false });
    UIComponents.Combobox.deselectAll(comboBoxes);
    this.initRules();
  },

  initRules() {
    const selectedCollection = $('#validationRulesModal').data('collection');
    if (!selectedCollection) return;

    Notification.start('#btnSaveValidationRules');

    const cmbValidationAction = $('#cmbValidationAction');
    const cmbValidationLevel = $('#cmbValidationLevel');

    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });
    Communicator.call({
      methodName: 'listCollectionNames',
      args: { dbName: connection.databaseName },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else if (result.result) {
          result.result.forEach((collection) => {
            if (collection.name === selectedCollection) {
              if (collection.options && collection.options.validationAction) cmbValidationAction.val(collection.options.validationAction).trigger('chosen:updated');
              if (collection.options && collection.options.validationLevel) cmbValidationLevel.val(collection.options.validationLevel).trigger('chosen:updated');

              if (collection.options.validator) UIComponents.Editor.setCodeMirrorValue($('#divValidator'), JSON.stringify(collection.options.validator, null, 1));
              else UIComponents.Editor.setCodeMirrorValue($('#divValidator'), '');
            }
          });
        }

        Notification.stop();
      }
    });
  },

  save() {
    Notification.start('#btnSaveValidationRules');

    const validationAction = $('#cmbValidationAction').val();
    const validationLevel = $('#cmbValidationLevel').val();
    const selectedCollection = $('#validationRulesModal').data('collection');

    let validator = UIComponents.Editor.getCodeMirrorValue($('#divValidator'));
    validator = ExtendedJSON.convertAndCheckJSON(validator);
    if (validator.ERROR) {
      Notification.error('syntax-error-validator', null, { error: validator.ERROR });
      return;
    }


    const command = {};
    command.collMod = selectedCollection;
    command.validator = validator;
    command.validationLevel = validationLevel;
    command.validationAction = validationAction;

    CollectionHelper.executeCommand(command, 'validationRulesModal');
  }
};

export default new CollectionValidationRules();
