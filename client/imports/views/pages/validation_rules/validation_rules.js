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
/*global swal*/


/*
 <div class="form-group">
 <label class="col-lg-2 control-label">Bucket Name</label>
 <div class="col-lg-10">
 <input id="txtBucketName" type="text" class="form-control"
 value="fs">
 </div>
 </div>
 * */

const initRules = function (selectedCollection) {
    Ladda.create(document.querySelector('#btnSaveValidationRules')).start();
    Helper.initializeCollectionsCombobox();

    if (!selectedCollection) {
        Ladda.stopAll();
        return;
    }

    const cmbValidationAction = $('#cmbValidationAction');
    const cmbValidationLevel = $('#cmbValidationLevel');

    cmbValidationLevel.prop('disabled', false).val('off').trigger("chosen:updated");
    cmbValidationAction.prop('disabled', false).val('warn').trigger("chosen:updated");

    //TODO empty all validators first

    const connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
    Meteor.call('listCollectionNames', connection.databaseName, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch rules");
        }
        else {
            if (result.result) {
                for (let collection of result.result) {
                    if (collection.name === selectedCollection) {
                        $('#btnAddRule').prop('disabled', false);
                        if (collection.options && collection.options.validationAction) {
                            cmbValidationAction.val(collection.options.validationAction);
                        }

                        if (collection.options && collection.options.validationLevel) {
                            cmbValidationLevel.val(collection.options.validationLevel);
                        }

                        console.log(collection.options);

                        //TODO iterate validators and add
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

    }
});