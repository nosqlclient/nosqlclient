import {Template} from 'meteor/templating';

import './upsert.html';
/**
 * Created by RSercan on 2.1.2016.
 */
Template.upsert.onRendered(function () {
    $('#divUpsert').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});