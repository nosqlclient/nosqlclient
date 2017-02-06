import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import Helper from "/client/imports/helper";
import "./convert_to_capped.html";

const toastr = require('toastr');
const Ladda = require('ladda');

export const resetForm = function () {
    $('#spanCollectionNameConvertToCapped').html($('#convertToCappedModal').data('collection'));
    $('#inputConvertToCappedSize').val('');
};

Template.convertToCapped.events({
    'click #btnConvertToCapped'(){
        Ladda.create(document.querySelector('#btnConvertToCapped')).start();

        const size = $('#inputConvertToCappedSize').val();
        const collection = $('#convertToCappedModal').data('collection');

        if (!size) {
            toastr.warning('Size is required !');
            Ladda.stopAll();
            return;
        }

        let command = {
            convertToCapped: collection,
            size: parseInt(size)
        };

        Meteor.call('command', command, false, {}, function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't convert");
            } else {
                toastr.success("Successfully converted to capped");
                $('#convertToCappedModal').modal('hide');
            }

            Ladda.stopAll();
        });
    }
});