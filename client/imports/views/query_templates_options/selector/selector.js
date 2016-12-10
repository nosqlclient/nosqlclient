/**
 * Created by RSercan on 3.1.2016.
 */
import {Template} from 'meteor/templating';
import Helper from '/client/imports/helper';

import './selector.html';

Template.selector.onRendered(function () {
    Helper.initializeCodeMirror($('#divSelector'), 'txtSelector', true);
});

export const getSelectorValue = function () {
    return Helper.getCodeMirrorValue($('#divSelector'));
};