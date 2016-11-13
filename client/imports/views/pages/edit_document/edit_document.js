import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {getSelectorValue} from '/client/imports/views/query_templates_common/selector/selector';

import './edit_document.html';

var toastr = require('toastr');

var Ladda = require('ladda');

/**
 * Created by RSercan on 15.2.2016.
 */

const initializeCollectionsCombobox = function () {
    var cmb = $('#cmbCollections');
    cmb.append($("<optgroup id='optGroupCollections' label='Collections'></optgroup>"));
    var cmbOptGroupCollection = cmb.find('#optGroupCollections');

    var collectionNames = Session.get(Helper.strSessionCollectionNames);
    $.each(collectionNames, function (index, value) {
        cmbOptGroupCollection.append($("<option></option>")
            .attr("value", value.name)
            .text(value.name));
    });
    cmb.chosen();

    cmb.on('change', function (evt, params) {
        var selectedCollection = params.selected;
        if (selectedCollection) {
            Helper.getDistinctKeysForAutoComplete(selectedCollection);
        }
    });
};

const initializeResultArea = function (result) {
    var divResult = $('#divResult');

    if (divResult.css('display') == 'none') {
        divResult.show();
        $('#divFooter').show();
    }


    Helper.initializeCodeMirror(divResult, 'txtDocument', false, 400);
    Helper.setCodeMirrorValue(divResult, result);
};

const deleteDocument = function () {

    var l = Ladda.create(document.querySelector('#btnDeleteDocument'));
    l.start();

    var collectionName = $('#cmbCollections').find(":selected").text();
    var idQuery = {_id: Session.get(Helper.strSessionEasyEditID)};

    Meteor.call('delete', collectionName, idQuery, function (err, result) {
        if (err) {
            toastr.error("Couldn't delete: " + err.message);
        }
        else if (result.result.result.ok == 1) {
            toastr.success('Successfuly deleted!');
            var divResult = $('#divResult');
            if (divResult.css('display') != 'none') {
                divResult.hide();
                $('#divFooter').hide();
            }

        }
        else {
            toastr.error("Couldn't delete: " + JSON.stringify(result));
        }


        Ladda.stopAll();
    });
};

const saveDocument = function () {

    var l = Ladda.create(document.querySelector('#btnSaveDocument'));
    l.start();

    var collectionName = $('#cmbCollections').find(":selected").text();
    var setValue = $('#divResult').data('editor').getValue();

    setValue = Helper.convertAndCheckJSON(setValue);
    if (setValue["ERROR"]) {
        toastr.error("Syntax error on document: " + setValue["ERROR"]);

        Ladda.stopAll();
        return;
    }

    if (Session.get(Helper.strSessionEasyEditID)) {
        // remove id just in case
        delete setValue._id;
        setValue = {"$set": setValue};
        var idQuery = {_id: Session.get(Helper.strSessionEasyEditID)};

        Meteor.call('updateOne', collectionName, idQuery, setValue, {}, function (err) {
                if (err) {
                    toastr.error("Couldn't update: " + err.message);
                } else {
                    toastr.success('Successfuly updated !');
                }

                Ladda.stopAll();
            }
        );
    } else {
        if (!(setValue instanceof Array)) {
            var newArray = [];
            newArray.push(setValue);
            setValue = newArray;
        }

        Meteor.call('insertMany', collectionName, setValue, function (err) {
                if (err) {
                    toastr.error("Couldn't insert: " + err.message);
                } else {
                    toastr.success('Successfuly inserted !');
                }

                Ladda.stopAll();
            }
        );
    }
};

const fetchDocument = function () {

    var l = Ladda.create(document.querySelector('#btnFetchDocument'));
    l.start();

    var collectionName = $('#cmbCollections').find(":selected").text();
    var selector = getSelectorValue();

    if (!collectionName) {
        toastr.warning('Please select a collection first !');

        Ladda.stopAll();
        return;
    }

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on query: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call("findOne", collectionName, selector, {}, function (err, result) {
            var divResult = $('#divResult');

            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't fetch document");
                if (divResult.css('display') != 'none') {
                    divResult.hide();
                    $('#divFooter').hide();
                }
            }
            else if (!result.result) {
                toastr.info("There's no matched document, you can insert one (array of documents are applicable) !");
                Session.set(Helper.strSessionEasyEditID, undefined);
                initializeResultArea('{}');
                $('#btnDeleteDocument').prop('disabled', true);
            }
            else {
                initializeResultArea(JSON.stringify(result.result, null, '\t'));
                Session.set(Helper.strSessionEasyEditID, result.result._id);
                $('#btnDeleteDocument').prop('disabled', false);
            }

            Ladda.stopAll();
        }
    );

};

Template.editDocument.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    initializeCollectionsCombobox();
    Session.set(Helper.strSessionEasyEditID, undefined);

    $('[data-toggle="tooltip"]').tooltip({trigger: 'hover'});
});

Template.editDocument.events({
    'click #btnInsertDocument'  (e) {
        e.preventDefault();

        if (!$('#cmbCollections').find(":selected").text()) {
            toastr.warning('Please select a collection first !');
            Ladda.stopAll();
            return;
        }

        Session.set(Helper.strSessionEasyEditID, undefined);
        initializeResultArea('{}');
        $('#btnDeleteDocument').prop('disabled', true);
    },

    'click #btnFetchDocument' (e) {
        e.preventDefault();
        fetchDocument();
    },

    'click #btnSaveDocument'  (e) {
        e.preventDefault();

        var text = Session.get(Helper.strSessionEasyEditID) ? 'This document will be overwritten, are you sure ?' : 'This document will be inserted, are you sure ?';
        swal({
            title: "Are you sure ?",
            text: text,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No"
        }, function (isConfirm) {
            if (isConfirm) {
                saveDocument();
            }
        });
    },

    'click #btnDeleteDocument'  (e) {
        e.preventDefault();
        swal({
            title: "Are you sure ?",
            text: "This document will be deleted, are you sure ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No"
        }, function (isConfirm) {
            if (isConfirm) {
                deleteDocument();
            }
        });
    }

});