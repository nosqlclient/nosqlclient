import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import Helper from "/client/imports/helper";
import {initIndexes} from "../index_management";
import "./add_index.html";

const toastr = require('toastr');
const Ladda = require('ladda');

export const clearForm = function () {
    $('.nav-tabs a[href="#tab-1-indexes"]').tab('show');
    $('.divField:visible').remove();
    $('#inputIndexName').val('');
    $('#inputTTL').val('');

    $('#inputUnique').iCheck('uncheck');
    $('#inputBackground').iCheck('uncheck');
    $('#inputSparse').iCheck('uncheck');

    Helper.setCodeMirrorValue($('#divPartial'), '');
    addField();
};

const addField = function () {
    const divField = $('.divField:hidden');
    const cloned = divField.clone();

    $('.divField:last').after(cloned);

    cloned.show();
    cloned.find('.cmbIndexTypes').chosen();
};

Template.addIndex.onRendered(function () {
    $('#divSparse, #divUnique, #divBackground').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    $('#accordion').on('show.bs.collapse', function () {
        Meteor.setTimeout(function () {
            const divSelector = $('#divPartial');
            Helper.initializeCodeMirror(divSelector, 'txtPartial');
            Helper.setCodeMirrorValue(divSelector, '');
        }, 300);

    });
});


Template.addIndex.events({
    'click .addField' (){
        addField();
    },

    'click .deleteField'(e){
        if ($('.divField:visible').length === 1) {
            toastr.warning('At least one field is required !');
            return;
        }
        $(e.currentTarget).parents('.divField').remove();
    },

    'click #btnSaveIndex' (){
        Ladda.create(document.querySelector('#btnSaveIndex')).start();
        const selectedCollection = $('#cmbCollections').val();

        let partialFilterExpression = Helper.getCodeMirrorValue($('#divPartial'));
        if (partialFilterExpression) {
            partialFilterExpression = Helper.convertAndCheckJSON(partialFilterExpression);
            if (partialFilterExpression["ERROR"]) {
                toastr.error("Syntax Error on partialFilterExpression: " + partialFilterExpression["ERROR"]);
                return;
            }
        }

        let ttl = $('#inputTTL').val();
        let indexName = $('#inputIndexName').val();
        let fields = {};
        let options = {};

        for (let divField of $('.divField:visible')) {
            divField = $(divField);
            let fieldVal = divField.find('.cmbIndexTypes').val();
            fieldVal = fieldVal === "1" ? 1 : (fieldVal === "-1" ? -1 : fieldVal);
            fields[divField.find('.txtFieldName').val()] = fieldVal;
        }

        if ($('#divUnique').iCheck('update')[0].checked) {
            options.unique = true;
        }
        if ($('#divBackground').iCheck('update')[0].checked) {
            options.background = true;
        }
        if (ttl) {
            options.expireAfterSeconds = ttl;
        }
        if ($('#divSparse').iCheck('update')[0].checked) {
            options.sparse = true;
        }
        if (partialFilterExpression) {
            options.partialFilterExpression = partialFilterExpression;
        }
        if (indexName) {
            options.name = indexName;
        }

        Meteor.call("createIndex", selectedCollection, fields, options, function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't create index");
            } else {
                toastr.success("Successfully created index");
                initIndexes();
                $('#addIndexModal').modal('hide');
            }

            Ladda.stopAll();
        });

    }
});