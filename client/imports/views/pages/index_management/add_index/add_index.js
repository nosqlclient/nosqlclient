import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import Helper from "/client/imports/helper";
import "./add_index.html";


Template.addIndex.onRendered(function () {
    $('.cmbIndexTypes').chosen();
    $('#inputUnique').iCheck('uncheck');
    $('#inputBackground').iCheck('uncheck');

    $('#accordion').on('show.bs.collapse', function () {
        Meteor.setTimeout(function () {
            Helper.initializeCodeMirror($('#divPartial'), 'txtPartial');
        }, 300);

    });
});

Template.addIndex.events({
    'click .addField' (){
        const divField = $('.divField:last');
        const cloned = divField.clone();
        cloned.find('.cmbIndexTypes').val("1");
        cloned.find('.txtFieldName').val("");

        divField.after(cloned);
        //TODO add fails for chosen
    }
    //TODO DELETE

});