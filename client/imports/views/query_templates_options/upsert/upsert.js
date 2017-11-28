import { Template } from 'meteor/templating';
import './upsert.html';

Template.upsert.onRendered(() => {
  $('#divUpsert').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});
