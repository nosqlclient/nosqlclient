import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import '/client/imports/views/query_templates_options/max_distance/max_distance.html';
import '/client/imports/views/query_templates_options/selector/selector';
import './geo_near_options.html';

Template.spherical.onRendered(() => {
  $('#divSpherical').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

Template.uniqueDocs.onRendered(() => {
  $('#divUniqueDocs').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

Template.includeLocs.onRendered(() => {
  $('#divIncludeLocs').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});
