import { Template } from 'meteor/templating';
import $ from 'jquery';
import '/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation';
import './insert_many_options.html';
import { UIComponents } from '../../../modules';

Template.serializeFunctions.onRendered(() => {
  UIComponents.Checkbox.init($('#inputSerializeFunctions'));
});
