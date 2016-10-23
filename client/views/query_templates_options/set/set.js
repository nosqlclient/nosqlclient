import {Template} from 'meteor/templating';
import Helper from '/client/helper';

/**
 * Created by sercan on 06.01.2016.
 */
Template.set.onRendered(function () {
    Helper.initializeCodeMirror($('#divSet'), 'txtSet');
});