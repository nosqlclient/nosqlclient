import {Template} from "meteor/templating";
import {Session} from "meteor/session";
import {Meteor} from "meteor/meteor";
import {FlowRouter} from "meteor/kadira:flow-router";
import {Connections} from "/lib/imports/collections/connections";
import Helper from "/client/imports/helper";
import "./validation_rules.html";

const toastr = require('toastr');
const Ladda = require('ladda');

/**
 * Created by RSercan on 15.2.2016.
 */

const initRules = function (selectedCollection) {
    Ladda.create(document.querySelector('#btnSaveValidationRules')).start();
    Helper.initializeCollectionsCombobox();

    if (!selectedCollection) {
        Ladda.stopAll();
        return;
    }

    const cmbValidationAction = $('#cmbValidationAction');
    const cmbValidationLevel = $('#cmbValidationLevel');

    // clear form
    cmbValidationLevel.prop('disabled', false).val('off').trigger("chosen:updated");
    cmbValidationAction.prop('disabled', false).val('warn').trigger("chosen:updated");

    const connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
    Meteor.call('listCollectionNames', connection.databaseName, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch rules");
        }
        else {
            if (result.result) {
                for (let collection of result.result) {
                    if (collection.name === selectedCollection) {
                        if (collection.options && collection.options.validationAction) {
                            cmbValidationAction.val(collection.options.validationAction);
                        }

                        if (collection.options && collection.options.validationLevel) {
                            cmbValidationLevel.val(collection.options.validationLevel);
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

Template.validationRules.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');

    this.autorun(() => {
        if (settings.ready() && connections.ready()) {
            Helper.initializeCodeMirror($('#divValidator'), 'txtValidator', false, 300);
            initRules();
        }
    });

});

Template.validationRules.events({
    'change #cmbCollections'(e){
        e.preventDefault();
        const selectedCollection = $("#cmbCollections").chosen().val();
        if (selectedCollection) {
            initRules(selectedCollection);
        }
    },

    'click #btnSaveValidationRules'  (e) {
        e.preventDefault();

        Ladda.create(document.querySelector('#btnSaveValidationRules')).start();

        const validationAction = $('#cmbValidationAction').val();
        const validationLevel = $('#cmbValidationLevel').val();
        const selectedCollection = $('#cmbCollections').val();

        if (!selectedCollection) {
            toastr.warning("Please select a collection first !");
            Ladda.stopAll();
            return;
        }

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

        Meteor.call('command', command, false, {}, function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't save rule");
            } else {
                toastr.success("Successfully saved");
            }

            Ladda.stopAll();
        });
    }

});