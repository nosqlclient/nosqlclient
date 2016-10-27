import {Template} from 'meteor/templating';
import Helper from '/client/imports/helper';

import './project.html';

/**
 * Created by RSercan on 1.1.2016.
 */
Template.project.onRendered(function () {
    Helper.initializeCodeMirror($('#divProject'), 'txtProject');
});