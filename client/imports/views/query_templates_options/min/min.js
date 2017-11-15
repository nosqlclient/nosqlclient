import { Template } from 'meteor/templating';
import Helper from '/client/imports/helper';

import './min.html';
/**
 * Created by RSercan on 2.1.2016.
 */
Template.min.onRendered(() => {
  Helper.initializeCodeMirror($('#divMin'), 'txtMin');
});
