import {Template} from "meteor/templating";
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

        if (!size) {
            toastr.warning('Size is required !');
            Ladda.stopAll();
            return;
        }

        Helper.warnDemoApp();
    }
});