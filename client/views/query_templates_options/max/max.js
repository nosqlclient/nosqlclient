import {Template} from 'meteor/templating';
import Helper from '/client/helper';

/**
 * Created by RSercan on 2.1.2016.
 */
Template.max.onRendered(function () {
    Helper.initializeCodeMirror($('#divMax'), 'txtMax');
});