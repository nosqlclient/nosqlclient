import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import Helper from "/client/imports/helper";
import "./rename_collection.html";
import {renderCollectionNames} from "../navigation";

const toastr = require('toastr');
const Ladda = require('ladda');

export const resetForm = function () {
    $('#spanCollectionNameRename').html($('#renameCollectionModal').data('collection'));
    $('#inputRenameName').val('');
    $('#divDropTarget').iCheck('uncheck');
};

Template.renameCollection.events({
    'click #btnRenameCollection'(){
        const newName = $('#inputRenameName').val();
        const collection = $('#renameCollectionModal').data('collection');

        if (!newName) {
            toastr.warning('Name is required !');
            Ladda.stopAll();
            return;
        }
        if (newName == collection) {
            toastr.warning('Can not use same name as target name !');
            Ladda.stopAll();
            return;
        }

        Helper.warnDemoApp();
    }
});