import { Notification, ErrorHandler, UIComponents, SessionManager, ExtendedJSON } from '/client/imports/modules';
import { Communicator, ReactivityProvider } from '/client/imports/facades';

const CollectionValidationRules = function () {};

CollectionValidationRules.prototype = {
  resetForm() {
    const combos = $('#cmbValidationAction, #cmbValidationLevel');
    const divValidator = $('#divValidator');

    UIComponents.Editor.initializeCodeMirror({ divSelector: divValidator, txtAreaId: 'txtValidator' });
    UIComponents.Editor.setCodeMirrorValue(divValidator, '', $('#txtValidator'));
    $('#spanCollectionNameValidationRules').html(`Valid for MongoDB 3.2 and higher<br/>${$('#validationRulesModal').data('collection')}`);
    combos.chosen();
    combos.find('option').prop('selected', false).trigger('chosen:updated');
    this.initRules();
  },

  initRules() {
    const selectedCollection = $('#validationRulesModal').data('collection');
    if (!selectedCollection) return;

    Notification.start('#btnSaveValidationRules');

    const cmbValidationAction = $('#cmbValidationAction');
    const cmbValidationLevel = $('#cmbValidationLevel');

    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection) });
    Communicator.call({
      methodName: 'listCollectionNames',
      args: { dbName: connection.databaseName },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't fetch rules");
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
      Notification.error(`Syntax Error on validator: ${validator.ERROR}`);
      return;
    }


    const command = {};
    command.collMod = selectedCollection;
    command.validator = validator;
    command.validationLevel = validationLevel;
    command.validationAction = validationAction;

    Communicator.call({
      methodName: 'command',
      args: { command },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't save rule");
        else {
          Notification.success('Successfully saved');
          $('#validationRulesModal').modal('hide');
        }
      }
    });
  }
};

export default new CollectionValidationRules();
