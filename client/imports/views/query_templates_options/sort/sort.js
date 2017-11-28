import { Template } from 'meteor/templating';
import { UIComponents } from '/client/imports/modules';
import './sort.html';

Template.sort.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divSort'), txtAreaId: 'txtSort' });
});
