import { Template } from 'meteor/templating';
import Helper from '/client/imports/helper';

import './max.html';

/**
 * Created by RSercan on 2.1.2016.
 */
Template.max.onRendered(() => {
  Helper.initializeCodeMirror($('#divMax'), 'txtMax');
});
