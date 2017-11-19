import { Template } from 'meteor/templating';
import Helper from '/client/imports/helpers/helper';

import './set.html';

/**
 * Created by sercan on 06.01.2016.
 */
Template.set.onRendered(() => {
  Helper.initializeCodeMirror($('#divSet'), 'txtSet');
});
