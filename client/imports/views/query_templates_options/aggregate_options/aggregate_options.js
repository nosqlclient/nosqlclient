import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import '/client/imports/views/query_templates_options/collation/collation';
import '/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation';
import '/client/imports/views/query_templates_options/max_time_ms/max_time_ms.html';
import '/client/imports/views/query_templates_options/explain/explain';
import './aggregate_options.html';

Template.allowDiskUse.onRendered(() => {
  $('#divAllowDiskUse').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});
