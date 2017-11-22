import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { UIComponents } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/max_distance/max_distance.html';
import '/client/imports/views/query_templates_options/limit/limit.html';
import './geo_haystack_search_options.html';

Template.search.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divSearch'), txtAreaId: 'txtSearch' });
});
