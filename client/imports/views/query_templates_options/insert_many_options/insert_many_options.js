import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import '/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation';
import './insert_many_options.html';

Template.serializeFunctions.onRendered(() => {
  $('#divSerializeFunctions').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});
