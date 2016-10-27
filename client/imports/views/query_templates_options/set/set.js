import {Template} from 'meteor/templating';
import Helper from '/client/imports/helper';

import './set.html';

/**
 * Created by sercan on 06.01.2016.
 */
Template.set.onRendered(function () {
    Helper.initializeCodeMirror($('#divSet'), 'txtSet');
});