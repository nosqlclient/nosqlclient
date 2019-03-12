import { Template } from 'meteor/templating';
import $ from 'jquery';
import '/client/imports/views/query_templates_options/min/min';
import '/client/imports/views/query_templates_options/max/max';
import '/client/imports/views/query_templates_options/collation/collation';
import './create_index_options.html';
import { UIComponents } from '../../../modules';

Template.dropDups.onRendered(() => {
  UIComponents.Checkbox.init($('#inputDropDups'));
});

Template.unique.onRendered(() => {
  UIComponents.Checkbox.init($('#inputUnique'));
});

Template.sparse.onRendered(() => {
  UIComponents.Checkbox.init($('#inputSparse'));
});

Template.background.onRendered(() => {
  UIComponents.Checkbox.init($('#inputBackground'));
});
