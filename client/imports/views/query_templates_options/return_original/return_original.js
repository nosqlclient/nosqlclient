import { Template } from 'meteor/templating';
import './return_original.html';

Template.returnOriginal.onRendered(() => {
  $('#divReturnOriginal').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});
