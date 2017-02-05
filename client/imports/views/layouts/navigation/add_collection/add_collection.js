import {Template} from "meteor/templating";
import {Session} from "meteor/session";
import {Meteor} from "meteor/meteor";
import Enums from "/lib/imports/enums";
import Helper from "/client/imports/helper";
import "./add_collection.html";
import {getOptions} from "./options/add_collection_options";
import {renderCollectionNames} from "../navigation";

const toastr = require('toastr');
const Ladda = require('ladda');

const clearForm = function () {
    Helper.setCodeMirrorValue($('#divValidatorAddCollection'), '');
    Helper.setCodeMirrorValue($('#divStorageEngine'), '');
    Helper.setCodeMirrorValue($('#divCollationAddCollection'), '');
    Helper.setCodeMirrorValue($('#divIndexOptionDefaults'), '');
    Helper.setCodeMirrorValue($('#divViewPipeline'), '');
    $('#inputCollectionViewName').val('');
    $('#divViewCollections').hide();
    $('#divViewPipelineFormGroup').hide();
    $('#inputCappedCollectionMaxDocs').val('');
    $('#inputCappedCollectionSize').val('');
    $('#inputCapped, #inputNoPadding, #inputTwoSizesIndexes').iCheck('uncheck');
    $('#divAutoIndexID').iCheck('check');
    $('#cmbCollectionOrView, #cmbCollectionsAddCollection, #cmbAddCollectionViewOptions, #cmbValidationActionAddCollection, #cmbValidationLevelAddCollection')
        .find('option').prop('selected', false).trigger('chosen:updated');
    Session.set(Helper.strSessionSelectedAddCollectionOptions, []);
};


const gatherOptions = function () {
    const options = getOptions();
    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        return;
    }
    let collationVal = Helper.getCodeMirrorValue($('#divCollationAddCollection'));
    if (collationVal) {
        options.collation = Helper.convertAndCheckJSON(collationVal);
        if (options.collation["ERROR"]) {
            toastr.error("Syntax error on collation: " + options.collation["ERROR"]);
            return;
        }
    }
    if ($('#cmbCollectionOrView').val() == 'view') {
        options.viewOn = $('#cmbCollectionsAddCollection').val();
        if (!options.viewOn) {
            toastr.warning('Please select a collection to create view on !');
            return;
        }

        options.pipeline = Helper.convertAndCheckJSON(Helper.getCodeMirrorValue($('#divViewPipeline')));
        if (options.pipeline["ERROR"]) {
            toastr.error("Syntax error on pipeline: " + options.pipeline["ERROR"]);
            return;
        }

        // views cant have storage engine and validator
        return options;
    }

    let storageEnginveVal = Helper.getCodeMirrorValue($('#divStorageEngine'));
    if (storageEnginveVal) {
        options.storageEngine = Helper.convertAndCheckJSON(storageEnginveVal);
        if (options.storageEngine["ERROR"]) {
            toastr.error("Syntax error on storageEngine: " + options.storageEngine["ERROR"]);
            return;
        }
    }

    options.validationAction = $('#cmbValidationActionAddCollection').val();
    options.validationLevel = $('#cmbValidationLevelAddCollection').val();
    let validatorVal = Helper.getCodeMirrorValue($('#divValidatorAddCollection'));
    if (validatorVal) {
        options.validator = Helper.convertAndCheckJSON(validatorVal);
        if (options.validator["ERROR"]) {
            toastr.error("Syntax error on validator: " + options.validator["ERROR"]);
            return;
        }
    }

    return options;
};

const initializeOptions = function () {
    const cmb = $('#cmbAddCollectionViewOptions');
    $.each(Helper.sortObjectByKey(Enums.ADD_COLLECTION_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });
    cmb.chosen();
    cmb.on('change', (evt, params) => {
        const array = Session.get(Helper.strSessionSelectedAddCollectionOptions);
        if (params.deselected) {
            array.remove(params.deselected);
        }
        else {
            array.push(params.selected);
        }
        Session.set(Helper.strSessionSelectedAddCollectionOptions, array);
    });
};

Template.addCollection.onRendered(function () {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        const target = $(e.target).attr("href");
        if (target === '#tab-2-engine') {
            Helper.initializeCodeMirror($('#divStorageEngine'), 'txtStorageEngine');
        }
        else if (target === '#tab-3-validator') {
            $('#cmbValidationActionAddCollection').chosen({
                allow_single_deselect: true
            });
            $('#cmbValidationLevelAddCollection').chosen({
                allow_single_deselect: true
            });
            Helper.initializeCodeMirror($('#divValidatorAddCollection'), 'txtValidatorAddCollection');
        }
        else if (target === '#tab-4-collation') {
            Helper.initializeCodeMirror($('#divCollationAddCollection'), 'txtCollationAddCollection');
        }
    });

    $('#cmbCollectionOrView').chosen();
    initializeOptions();

    $('#collectionAddModal').on('shown.bs.modal', function () {
        clearForm();
    });
});

Template.addCollection.events({
    'click #anchorStorageEngine' (){
        if (!$('#anchorStorageEngine').attr('data-toggle')) {
            toastr.warning('Views can not have storage engine !');
        }
    },

    'click #anchorValidator' (){
        if (!$('#anchorValidator').attr('data-toggle')) {
            toastr.warning('Views can not have validator !');
        }
    },

    'change #cmbCollectionOrView' (){
        const anchorStorageEngineSelector = $('#anchorStorageEngine');
        const anchorValidatorSelector = $('#anchorValidator');
        const collectionOrView = $('#cmbCollectionOrView').val();
        const divViewCollections = $('#divViewCollections');
        const divViewPipeline = $('#divViewPipelineFormGroup');
        const cmbOptions = $('#cmbAddCollectionViewOptions');

        if (collectionOrView === 'collection') {
            divViewCollections.hide();
            divViewPipeline.hide();
            anchorStorageEngineSelector.attr('data-toggle', 'tab');
            anchorValidatorSelector.attr('data-toggle', 'tab');
            cmbOptions.prop('disabled', false).trigger('chosen:updated');
        } else {
            anchorValidatorSelector.removeAttr("data-toggle");
            anchorStorageEngineSelector.removeAttr("data-toggle");
            divViewCollections.show();
            divViewPipeline.show();
            cmbOptions.prop('disabled', true);
            cmbOptions.find('option').prop('selected', false).trigger('chosen:updated');
            Session.set(Helper.strSessionSelectedAddCollectionOptions, []);
            const cmb = $('#cmbCollectionsAddCollection');
            cmb.empty();
            cmb.append($("<option></option>"));
            $.each(Session.get(Helper.strSessionCollectionNames), function (index, value) {
                cmb.append($("<option></option>")
                    .attr("value", value.name)
                    .text(value.name));
            });
            cmb.chosen({
                create_option: true,
                allow_single_deselect: true,
                persistent_create_option: true,
                skip_no_results: true
            }).trigger('chosen:updated');

            Helper.initializeCodeMirror($('#divViewPipeline'), 'txtViewPipeline');
        }
    },

    'click #btnCreateCollection'(e) {
        e.preventDefault();
        const name = $('#inputCollectionViewName').val();
        if (!name) {
            toastr.warning('Please enter a name !');
            return;
        }

        const options = gatherOptions();
        if (!options) {
            return;
        }

        Ladda.create(document.querySelector('#btnCreateCollection')).start();
        Meteor.call('createCollection', name, options, function (err, res) {
            if (err || (res && res.error)) {
                Helper.showMeteorFuncError(err, res, "Couldn't create");
            } else {
                renderCollectionNames();
                $('#collectionAddModal').modal('hide');
                toastr.success('Successfuly created collection: ' + name);
            }

            Ladda.stopAll();
        });
    }
});
