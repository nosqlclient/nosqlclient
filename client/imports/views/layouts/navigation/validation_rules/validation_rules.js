import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import {Connections} from "/lib/imports/collections/connections";
import Helper from "/client/imports/helper";
import "./validation_rules.html";

const toastr = require('toastr');
const Ladda = require('ladda');

export const resetForm = function () {
    const combos = $('#cmbValidationAction, #cmbValidationLevel');
    const divValidator = $('#divValidator');

    Helper.initializeCodeMirror(divValidator, 'txtValidator');
    Helper.setCodeMirrorValue(divValidator, '', $('#txtValidator'));
    $('#spanCollectionNameValidationRules').html("Valid for MongoDB 3.2 and higher<br/>" + $('#validationRulesModal').data('collection'));
    combos.chosen();
    combos.find('option').prop('selected', false).trigger('chosen:updated');
    initRules();
};

const initRules = function () {
    Ladda.create(document.querySelector('#btnSaveValidationRules')).start();

    const selectedCollection = $('#validationRulesModal').data('collection');
    if (!selectedCollection) {
        Ladda.stopAll();
        return;
    }

    const cmbValidationAction = $('#cmbValidationAction');
    const cmbValidationLevel = $('#cmbValidationLevel');

    const connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
    Meteor.call('listCollectionNames', connection.databaseName,Meteor.default_connection._lastSessionId, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch rules");
        }
        else {
            if (result.result) {
                for (let collection of result.result) {
                    if (collection.name === selectedCollection) {
                        if (collection.options && collection.options.validationAction) {
                            cmbValidationAction.val(collection.options.validationAction).trigger('chosen:updated');
                        }

                        if (collection.options && collection.options.validationLevel) {
                            cmbValidationLevel.val(collection.options.validationLevel).trigger('chosen:updated');
                        }

                        if (collection.options.validator) {
                            Helper.setCodeMirrorValue($('#divValidator'), JSON.stringify(collection.options.validator, null, 1));
                        } else {
                            Helper.setCodeMirrorValue($('#divValidator'), "");
                        }
                    }
                }
            }
        }

        Ladda.stopAll();
    });
};

Template.validationRules.events({
    'click #btnSaveValidationRules'(){
        Ladda.create(document.querySelector('#btnSaveValidationRules')).start();

        const validationAction = $('#cmbValidationAction').val();
        const validationLevel = $('#cmbValidationLevel').val();
        const selectedCollection = $('#validationRulesModal').data('collection');

        let validator = Helper.getCodeMirrorValue($('#divValidator'));
        validator = Helper.convertAndCheckJSON(validator);
        if (validator["ERROR"]) {
            toastr.error("Syntax Error on validator: " + validator["ERROR"]);
            Ladda.stopAll();
            return;
        }


        const command = {};
        command.collMod = selectedCollection;
        command.validator = validator;
        command.validationLevel = validationLevel;
        command.validationAction = validationAction;

        Meteor.call('command', command, false, {},Meteor.default_connection._lastSessionId, function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't save rule");
            } else {
                toastr.success("Successfully saved");
                $('#validationRulesModal').modal('hide');
            }

            Ladda.stopAll();
        });
    }
});