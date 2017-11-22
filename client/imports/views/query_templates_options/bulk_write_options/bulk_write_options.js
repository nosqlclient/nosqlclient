import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import '/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation';
import './bulk_write_options.html';

Template.ordered.onRendered(() => {
  $('#divOrdered').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});
