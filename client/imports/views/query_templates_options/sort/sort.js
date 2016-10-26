import {Template} from 'meteor/templating';
import Helper from '/client/imports/helper';

import './sort.html';
/**
 * Created by RSercan on 1.1.2016.
 */
Template.sort.onRendered(function () {
    Helper.initializeCodeMirror($('#divSort'), 'txtSort');
});