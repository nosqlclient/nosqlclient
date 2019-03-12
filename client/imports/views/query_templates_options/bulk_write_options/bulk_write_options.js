import { Template } from 'meteor/templating';
import $ from 'jquery';
import '/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation';
import './bulk_write_options.html';
import { UIComponents } from '../../../modules';

Template.ordered.onRendered(() => {
  UIComponents.Checkbox.init($('#inputOrdered'));
});
