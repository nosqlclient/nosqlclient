import { Template } from 'meteor/templating';
import $ from 'jquery';
import '/client/imports/views/query_templates_options/collation/collation';
import '/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation';
import '/client/imports/views/query_templates_options/max_time_ms/max_time_ms.html';
import '/client/imports/views/query_templates_options/explain/explain';
import '/client/imports/views/query_templates_options/hint/hint';
import './aggregate_options.html';
import { UIComponents } from '../../../modules';

Template.allowDiskUse.onRendered(() => {
  UIComponents.Checkbox.init($('#inputAllowDiskUse'));
});
