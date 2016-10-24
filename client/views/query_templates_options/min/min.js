import {Template} from 'meteor/templating';
import Helper from '/client/helper';

/**
 * Created by RSercan on 2.1.2016.
 */
Template.min.onRendered(function () {
    Helper.initializeCodeMirror($('#divMin'), 'txtMin');
});
