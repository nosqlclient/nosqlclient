/**
 * Created by sercan on 09.12.2016.
 */
import {Template} from 'meteor/templating';

import './explain.html';
Template.explain.onRendered(function () {
    $('#divExecuteExplain').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
    $('#inputExecuteExplain').iCheck('uncheck');
});