import {Template} from "meteor/templating";
import {Session} from "meteor/session";
import {Meteor} from "meteor/meteor";
import Enums from "/lib/imports/enums";
import {Connections} from "/lib/imports/collections";
import Helper from "/client/imports/helper";
import "./add_collection.html";
import {getOptions} from "./options/add_collection_options";
import {renderCollectionNames} from "../navigation";

const toastr = require('toastr');
const Ladda = require('ladda');

export const initializeForm = function (collection) {
    Ladda.create(document.querySelector('#btnCreateCollection')).start();

    const connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
    Meteor.call('listCollectionNames', connection.databaseName, Meteor.default_connection._lastSessionId, function (err, result) {
        if (err || result.error) {
            Ladda.stopAll();
            Helper.showMeteorFuncError(err, result, "Couldn't fetch data");
            $('#collectionAddModal').modal('hide');
        }
        else {
            Ladda.stopAll();
            let found = false;
            if (result.result) {
                for (let col of result.result) {
                    if (col.name === collection) {
                        prepareShowForm(col);
                        found = true;
                    }
                }
            }

            if (!found) {
                toastr.warning("Couldn't find collection in response of getCollectionInfos");
                $('#collectionAddModal').modal('hide');
            }
        }

    });
};

export const resetForm = function () {
    prepareFormAsCollection();
    $('.nav-tabs a[href="#tab-1-options"]').tab('show');
    Helper.setCodeMirrorValue($('#divValidatorAddCollection'), '', $('#txtValidatorAddCollection'));
    Helper.setCodeMirrorValue($('#divStorageEngine'), '', $('#txtStorageEngine'));
    Helper.setCodeMirrorValue($('#divCollationAddCollection'), '', $('#txtCollationAddCollection'));
    Helper.setCodeMirrorValue($('#divIndexOptionDefaults'), '', $('#txtIndexOptionDefaults'));
    Helper.setCodeMirrorValue($('#divViewPipeline'), '', $('#txtViewPipeline'));

    $('#inputCollectionViewName').val('');
    $('#inputCappedCollectionMaxDocs').val('');
    $('#inputCappedCollectionSize').val('');
    $('#inputCapped, #inputNoPadding, #inputTwoSizesIndexes').iCheck('uncheck');
    $('#cmbCollectionOrView, #cmbCollectionsAddCollection, #cmbAddCollectionViewOptions, #cmbValidationActionAddCollection, #cmbValidationLevelAddCollection')
        .find('option').prop('selected', false).trigger('chosen:updated');
    $('#collectionAddModalTitle').text('Create Collection/View');
    $('#spanColName').text(Connections.findOne({_id: Session.get(Helper.strSessionConnection)}).connectionName);
    $('#btnCreateCollection').prop('disabled', false);

    Session.set(Helper.strSessionSelectedAddCollectionOptions, []);
};

const setOptionsForCollection = function (col) {
    let optionsToSelect = [];
    if (col.options.capped) {
        optionsToSelect.push('CAPPED');
        Session.set(Helper.strSessionSelectedAddCollectionOptions, optionsToSelect);

        // let view initialize
        Meteor.setTimeout(function () {
            $('#inputCappedCollectionMaxDocs').val(col.options.max);
            $('#inputCappedCollectionSize').val(col.options.size);
        }, 100);
    }
    if (col.options.flags) {
        optionsToSelect.push('FLAGS');
        Session.set(Helper.strSessionSelectedAddCollectionOptions, optionsToSelect);

        // let view initialize
        Meteor.setTimeout(function () {
            const twoSizesIndexes = $('#inputTwoSizesIndexes');
            const noPadding = $('#inputNoPadding');

            if (col.options.flags === 0) {
                twoSizesIndexes.iCheck('uncheck');
                noPadding.iCheck('uncheck');
            } else if (col.options.flags === 1) {
                twoSizesIndexes.iCheck('check');
                noPadding.iCheck('uncheck');
            } else if (col.options.flags === 2) {
                twoSizesIndexes.iCheck('uncheck');
                noPadding.iCheck('check');
            } else if (col.options.flags === 3) {
                twoSizesIndexes.iCheck('check');
                noPadding.iCheck('check');
            }
        }, 100);

    }
    if (col.options.indexOptionDefaults) {
        Session.set(Helper.strSessionSelectedAddCollectionOptions, optionsToSelect);
        optionsToSelect.push('INDEX_OPTION_DEFAULTS');

        // let view initialize
        Meteor.setTimeout(function () {
            Helper.setCodeMirrorValue($('#divIndexOptionDefaults'), JSON.stringify(col.options.indexOptionDefaults), $('#txtIndexOptionDefaults'));
        }, 100);
    }

    $('#cmbAddCollectionViewOptions').val(optionsToSelect).trigger('chosen:updated');
};

const setStorageEngineAndValidator = function (col) {
    if (col.options.storageEngine) {
        Helper.setCodeMirrorValue($('#divStorageEngine'), JSON.stringify(col.options.storageEngine), $('#txtStorageEngine'));
    }
    if (col.options.validator || col.options.validationLevel || col.options.validationAction) {
        if (col.options.validator) {
            Helper.setCodeMirrorValue($('#divValidatorAddCollection'), JSON.stringify(col.options.validator), $('#txtValidatorAddCollection'));
        }
        if (col.options.validationAction) {
            $('#cmbValidationActionAddCollection').val(col.options.validationAction).trigger('chosen:updated');
        }
        if (col.options.validationLevel) {
            $('#cmbValidationLevelAddCollection').val(col.options.validationLevel).trigger('chosen:updated');
        }

    }
};

const prepareShowForm = function (col) {
    const cmbCollectionOrView = $('#cmbCollectionOrView');
    const modalTitle = $('#collectionAddModalTitle');
    $('.nav-tabs a[href="#tab-1-options"]').tab('show');

    if (col.type === 'view') {
        prepareFormAsView();
        modalTitle.text('View Information');
        cmbCollectionOrView.val('view').trigger('chosen:updated');
        $('#cmbCollectionsAddCollection').val(col.options.viewOn).trigger('chosen:updated');
        if (col.options.pipeline) {
            Helper.setCodeMirrorValue($('#divViewPipeline'), JSON.stringify(col.options.pipeline), $('#txtViewPipeline'));
        }
    }
    else {
        prepareFormAsCollection();
        modalTitle.text('Collection Information');
        cmbCollectionOrView.val('collection').trigger('chosen:updated');
        setStorageEngineAndValidator(col);
        setOptionsForCollection(col);
    }

    $('#inputCollectionViewName').val(col.name);
    $('#spanColName').text(col.name);
    $('#btnCreateCollection').prop('disabled', true);

    if (col.options.collation) {
        Helper.setCodeMirrorValue($('#divCollationAddCollection'), JSON.stringify(col.options.collation), $('#txtCollationAddCollection'));
    }

};

const prepareFormAsCollection = function () {
    $('#divViewCollections').hide();
    $('#divViewPipelineFormGroup').hide();
    $('#anchorStorageEngine').attr('data-toggle', 'tab');
    $('#anchorValidator').attr('data-toggle', 'tab');
    $('#cmbAddCollectionViewOptions').prop('disabled', false).trigger('chosen:updated');
};

const prepareFormAsView = function () {
    const cmbOptions = $('#cmbAddCollectionViewOptions');
    $('#anchorValidator').removeAttr("data-toggle");
    $('#anchorStorageEngine').removeAttr("data-toggle");
    $('#divViewCollections').show();
    $('#divViewPipelineFormGroup').show();
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
        if ($('#cmbCollectionOrView') === 'collection') {
            prepareFormAsCollection();
        } else {
            prepareFormAsView();
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

        Meteor.call('createCollection', name, options, Meteor.default_connection._lastSessionId, function (err, res) {
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
