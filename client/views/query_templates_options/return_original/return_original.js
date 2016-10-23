import {Template} from 'meteor/templating';

/**
 * Created by RSercan on 2.1.2016.
 */
Template.returnOriginal.onRendered(function () {
    $('#divReturnOriginal').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});
