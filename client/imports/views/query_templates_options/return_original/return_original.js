import { Template } from 'meteor/templating';

import './return_original.html';
/**
 * Created by RSercan on 2.1.2016.
 */
Template.returnOriginal.onRendered(() => {
  $('#divReturnOriginal').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});
