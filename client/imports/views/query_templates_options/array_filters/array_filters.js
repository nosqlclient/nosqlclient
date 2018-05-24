import { Template } from 'meteor/templating';
import { UIComponents } from '/client/imports/modules';
import './array_filters.html';

Template.arrayFilters.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divArrayFilters'), txtAreaId: 'txtArrayFilters' });
});
