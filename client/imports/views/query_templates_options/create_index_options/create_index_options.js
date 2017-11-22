import { Template } from 'meteor/templating';
import $ from 'jquery';
import '/client/imports/views/query_templates_options/min/min';
import '/client/imports/views/query_templates_options/max/max';
import '/client/imports/views/query_templates_options/collation/collation';
import './create_index_options.html';

Template.dropDups.onRendered(() => {
  $('#divDropDups').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

Template.unique.onRendered(() => {
  $('#divUnique').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

Template.sparse.onRendered(() => {
  $('#divSparse').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

Template.background.onRendered(() => {
  $('#divBackground').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});
