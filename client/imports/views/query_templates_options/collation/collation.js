/**
 * Created by RSercan on 3.1.2016.
 */
import { Template } from 'meteor/templating';
import Helper from '/client/imports/helpers/helper';

import './collation.html';

Template.collation.onRendered(() => {
  Helper.initializeCodeMirror($('#divCollation'), 'txtCollation');
});
